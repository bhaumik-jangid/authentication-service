import { connectToMongo } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Dev from "@/models/devModel";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mailer";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token, type } = reqBody;
        let user = null;
        if (type === 0) {
            user = await User.findOneAndUpdate(
                { emailVerifyToken: token, emailVerifyTokenExpire: { $gt: Date.now() } },
                { $set: { isVerified: true, emailVerifyToken: null, emailVerifyTokenExpire: null } },
                { new: true }
            );
        } else if (type === 1) {
            user = await Dev.findOneAndUpdate(
                { emailVerifyToken: token, emailVerifyTokenExpire: { $gt: Date.now() } },
                { $set: { isVerified: true, emailVerifyToken: null, emailVerifyTokenExpire: null } },
                { new: true }
            );
        }

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }
        
        await sendEmail({
            username: user.username,
            email: user.email,
            emailType: type === 0 ? "USER_CONFIRM" : "DEV_CONFIRM",
            userID: user._id
        });

        return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });

    } catch (error) {
        console.log("Error in api/auth/verifyMail: ", error);
        return NextResponse.json({ error: (error as Error).message || "An unexpected error occurred" }, { status: 500 });
    }
}
