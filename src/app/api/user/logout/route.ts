import {connectToMongo} from "@/dbConfig/dbConfig"
import { NextResponse } from 'next/server'

connectToMongo();

export async function POST(){
    try {
        const response = NextResponse.json({message: "User logged out successfully", success: true}, {status: 200})
        response.cookies.set("token", "", {
            httpOnly: true,
            path: "/",
            expires: new Date(0), // Expire the cookie immediately
        });
        console.log("Logout complted");

        return response;

    } catch (error) {
        console.log("Error in users/logout : ", error);
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        } else {
            return NextResponse.json({error: "An unknown error occurred"}, {status: 500});
        }
    }
}