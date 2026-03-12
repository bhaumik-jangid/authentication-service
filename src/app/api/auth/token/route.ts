import { NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/dbConfig/dbConfig";
import DataFromJWT from "@/utils/DataFromJWT";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const data = await DataFromJWT(request);
        return NextResponse.json({data}, { status: 200});

    } catch (error) {
        console.error("Error in /api/auth/token:", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}
