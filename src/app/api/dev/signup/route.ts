import { connectToMongo } from "@/dbConfig/dbConfig";
import Dev from "@/models/devModel";
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import axios from "axios";

connectToMongo();

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const reqBody = await request.json();
        const { username, email, password } = reqBody;
        const emailType = "DEV_VERIFY";

        // Check if the username already exists
        const existingUsername = await Dev.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { message: "Username is already taken." },
                { status: 400 }
            );
        }

        // Check if the email is already in use
        const existingEmail = await Dev.findOne({ email });
        if (existingEmail) {
            return NextResponse.json(
                { message: "This email is already associated with an account." },
                { status: 400 }
            );
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the developer account
        const newDev = new Dev({
            username,
            email,
            password: hashedPassword,
        });

        const savedDev = await newDev.save();

        // Send verification email
        await axios.post(`${process.env.DOMAIN}/api/auth/sendMail`, {
            email,
            emailType
        });

        return NextResponse.json(
            {
                message: "Developer account created successfully. Please verify your email.",
                success: true,
                savedDev,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error in /api/dev/signup:", error);
        return NextResponse.json(
            { message: "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
