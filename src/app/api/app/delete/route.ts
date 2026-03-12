import App from "@/models/appModel";
import Dev from "@/models/devModel";
import User from "@/models/userModel";
import {connectToMongo} from "@/dbConfig/dbConfig";
import DataFromJWT from "@/utils/DataFromJWT";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mailer";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const data = await DataFromJWT(request);
        const devID = data?.id;

        const reqbody = await request.json();
        const { appID } = reqbody;

        const dev = await Dev.findOne({ _id: devID });
        const app = await App.findOne({ appID });

        if (!app || !dev) {
            return NextResponse.json(
                { message: "Invalid or missing App", status: 401 },
                { status: 401 }
            );
        }

        if (String(app.developerID) !== String(devID)) {
            return NextResponse.json(
                { message: "You are not authorized to delete this app", status: 401 },
                { status: 401 }
            );
        }

        // Start MongoDB session for transaction
        const session = await App.startSession();
        session.startTransaction();

        try {
            // Step 1: Find all users associated with this app
            const usersToDelete = await User.find({ appID: app.appID }).lean();

            // Step 2: Delete all users associated with the app
            const deletedUsers = await User.deleteMany({ appID: app.appID }, { session });

            // Step 3: Delete the app itself
            const deletedApp = await App.findByIdAndDelete(app._id, { session });
            if (!deletedApp) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json(
                    { message: "App not found, deletion rolled back.", status: 404 },
                    { status: 404 }
                );
            }

            // Step 4: Commit transaction if both deletions succeed
            await session.commitTransaction();
            session.endSession();

            // Step 5: Send deletion emails asynchronously

            // 1. Notify Developer
            await axios.post(`${process.env.DOMAIN}/api/auth/sendMail`, {
                developerID: devID,
                email: dev.email,
                emailType: "APP_DELETED",
                appID,
                appName: app.appName,
            });

            // 2. Notify all affected users (if any)
            if (usersToDelete.length > 0) {
                await Promise.all(
                    usersToDelete.map(async (user) => {
                        try {
                            await sendEmail({
                                username: user.username,
                                email: user.email,
                                emailType: "USER_DELETED",
                                appName: app.appName,
                                userID: String(user._id),
                            });
                        } catch (emailError) {
                            console.error(`Failed to send email to ${user.email}:`, (emailError as Error).message);
                        }
                    })
                );
            }

            // Return success response
            return NextResponse.json(
                { message: "App and associated users deleted successfully. Redirecting to Dashboard...", status: 200 },
                { status: 200 }
            );

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.log("Error in /api/app/delete:", error);
        return NextResponse.json(
            { error: (error as Error).message, status: 500 },
            { status: 500 }
        );
    }
}
