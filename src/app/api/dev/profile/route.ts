import { connectToMongo } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import DataFromJWT from "@/utils/DataFromJWT";
import Dev from "@/models/devModel";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const data = await DataFromJWT(request);
        const devId = data?.id; 
        if (!devId) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid or missing token" },
                { status: 401 }
            );
        }

        const dev = await Dev.findById(devId).select("-password").lean();
        if (!dev) {
            return NextResponse.json(
                { error: "Developer account not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Developer found", data: dev },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error in /api/dev/profile:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
