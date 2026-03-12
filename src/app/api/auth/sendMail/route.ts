import { connectToMongo } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Dev from "@/models/devModel";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mailer";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import App from "@/models/appModel";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, emailType, developerID, appID, appName } = reqBody;

        // Validate emailType
        const validEmailTypes = [
            "USER_VERIFY",
            "USER_CONFIRM",
            "DEV_VERIFY",
            "DEV_CONFIRM",
            "APP_CREATED",
            "APP_DELETED",
        ];

        if (!validEmailTypes.includes(emailType)) {
            return NextResponse.json(
                { message: "Invalid emailType" },
                { status: 400 }
            );
        }

        let user = null;
        let dev = null;
        let token = '';
        let hashedToken = null;
        let expirationTime = null;

        // Handle email types that require token generation
        if (emailType === "USER_VERIFY" || emailType === "DEV_VERIFY") {
            token = crypto.randomBytes(32).toString("hex");
            hashedToken = await bcryptjs.hash(token.toString(), 10);
            expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + 1);
        }

        // Handle USER_VERIFY and USER_CONFIRM
        if (emailType.startsWith("USER_")) {
            const app = await App.findOne({ appName });
            user = await User.findOneAndUpdate(
                { email, appID: app.appID },
                {
                    emailVerifyToken: hashedToken,
                    emailVerifyTokenExpire: expirationTime,
                },
                { new: true }
            );

            if (!user) {
                return NextResponse.json(
                    { message: "User does not exist" },
                    { status: 400 }
                );
            }

            if (emailType === "USER_VERIFY" && user.isVerified) {
                return NextResponse.json(
                    { message: "User is already verified" },
                    { status: 400 }
                );
            }
        }

        // Handle DEV_VERIFY and DEV_CONFIRM
        if (emailType.startsWith("DEV_")) {
            dev = await Dev.findOneAndUpdate(
                { email },
                {
                    emailVerifyToken: hashedToken,
                    emailVerifyTokenExpire: expirationTime,
                },
                { new: true }
            );

            if (!dev) {
                return NextResponse.json(
                    { message: "Developer does not exist" },
                    { status: 400 }
                );
            }

            if (emailType === "DEV_VERIFY" && dev.isVerified) {
                return NextResponse.json(
                    { message: "Developer is already verified" },
                    { status: 400 }
                );
            }
        }

        // Send email
        await sendEmail({
            username: user?.username || dev?.username,
            email,
            emailType,
            userID: user?._id || dev?._id,
            token: hashedToken || undefined,
            appID,
            appName,
        });

        return NextResponse.json(
            { message: "Email sent successfully", success: true },
            { status: 200 }
        );

    } catch (error) {
        console.log("Error in api/auth/sendMail: ", error);
        const response = NextResponse.json(
            { error: (error as Error).message },
            { status: 201 }
        );
        return response;
    }
}