import { connectToMongo } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import DataFromJWT from "@/utils/DataFromJWT";
import { NextRequest, NextResponse } from "next/server";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        // Extract dev ID from JWT token
        const user = await DataFromJWT(request);
        if (!user) {
            console.log("user: ", user);
            return NextResponse.json(
                { message: "Unauthorized: Invalid or missing token" },
                { status: 401 }
            );
        }
        const userId = user.id;
        if (!userId) {
            console.log("userId: ", userId);
            return NextResponse.json(
                { message: "Unauthorized: Invalid or missing token" },
                { status: 401 }
            );
        }

        // Delete developer account
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            console.log("User account not found, deletion rolled back.");
            return NextResponse.json(
                { message: "User account not found" },
                { status: 404 }
            );
        }

        // Clear auth token from cookies
        const response = NextResponse.json(
            { message: "Account deleted successfully. Redirecting to login page..." },
            { status: 200 }
        );
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0), // Expire the cookie immediately
        });
        
        console.log(`Developer account (ID: ${userId}) deleted successfully.`);
        return response; 

    } catch (error) {
        console.error("Error in /api/dev/delete:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
