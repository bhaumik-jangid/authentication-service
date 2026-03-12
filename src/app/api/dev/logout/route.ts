import { connectToMongo } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connectToMongo();

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const response = NextResponse.json(
            { message: "Developer logged out successfully", success: true },
            { status: 200 }
        );

        // Clear the token cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            path: "/",
            sameSite: "strict",
            expires: new Date(0),
        });

        console.log("Logout completed successfully");

        return response;

    } catch (error) {
        console.error("Error in /api/dev/logout:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}
