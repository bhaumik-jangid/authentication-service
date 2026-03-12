import App from "@/models/appModel";
import Dev from "@/models/devModel";
import User from "@/models/userModel";
import { connectToMongo } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";
import DataFromJWT from "@/utils/DataFromJWT";
import { sendEmail } from "@/utils/mailer";

connectToMongo();

export async function POST(request: NextRequest) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const data = await DataFromJWT(request);
        const devId = data?.id;
        if (!devId) {
            return NextResponse.json(
                { message: "Unauthorized: Invalid or missing token" },
                { status: 401 }
            );
        }

        // Step 1: Find all apps associated with the developer
        const appsToDelete = await App.find({ developerID: devId }).lean();
        const appIds = appsToDelete.map((app) => app._id);

        // Step 2: Find and delete users associated with those apps
        const usersToDelete = await User.find({ appID: { $in: appIds } }).lean();
        await User.deleteMany({ appID: { $in: appIds } }).session(session);

        // Step 3: Delete all apps of the developer
        await App.deleteMany({ developerID: devId }).session(session);

        // Step 4: Delete the developer account
        const deletedDev = await Dev.findByIdAndDelete(devId).session(session);
        if (!deletedDev) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Developer account not found, deletion rolled back." },
                { status: 404 }
            );
        }

        // Step 5: Commit transaction if everything is successful
        await session.commitTransaction();
        session.endSession();

        // Step 6: Prepare app-user mapping for emails
        const appMap = new Map();
        appsToDelete.forEach((app) => {
            appMap.set(String(app._id), app.appName);
        });

        // Step 7: Send Email Notifications (Non-blocking)
        await Promise.allSettled([
            sendEmail({
                username: deletedDev.username,
                email: deletedDev.email,
                emailType: "DEV_DELETED",
                userID: String(deletedDev._id),
            }),

            ...usersToDelete.map((user) =>
                sendEmail({
                    username: user.username,
                    email: user.email,
                    emailType: "USER_DELETED",
                    appName: appMap.get(String(user.appID)) || "Unknown App",
                    userID: String(user._id),
                })
            ),

            ...appsToDelete.map((app) =>
                axios.post(`${process.env.DOMAIN}/api/auth/sendMail`, {
                    developerID: devId,
                    email: deletedDev.email,
                    emailType: "APP_DELETED",
                    appID: app.appID,
                    appName: app.appName,
                })
            ),
        ]);

        // Step 8: Clear Auth Token & Respond
        const response = NextResponse.json(
            { message: "Developer account and associated apps deleted successfully." },
            { status: 200 }
        );
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
        });

        return response;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in /api/dev/delete:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
