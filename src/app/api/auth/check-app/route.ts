import { NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/dbConfig/dbConfig";
import App from "@/models/appModel";
import DataFromJWT from "@/utils/DataFromJWT";

connectToMongo();

export async function POST(request: NextRequest) {
    try {
        const reqbody = await request.json();
        const { appName } = reqbody;
        if (!appName) {
            return NextResponse.json({ exists: false, error: "Missing appName." }, { status: 400 });
        }

        const app = await App.findOne({ appName }).collation({ locale: "en", strength: 2 });

        if (!app) {
            return NextResponse.json({ exists: false, error: "App does not exist." }, { status: 404 });
        }
        return NextResponse.json({ exists: true }, { status: 200});

    } catch (error) {
        console.error("Error in /api/check-app:", error);
        return NextResponse.json({exists: false, error: "Server error." }, { status: 500 });
    }
}
