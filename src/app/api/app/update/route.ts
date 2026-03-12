import { connectToMongo } from "@/dbConfig/dbConfig";
import App from "@/models/appModel";
import { NextRequest, NextResponse } from "next/server";

connectToMongo();

export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { appID, appName, redirectAfterLogin } = reqBody;

        if (!appID || !appName || !redirectAfterLogin) {
            return NextResponse.json(
                { message: "All fields (appID, appName, redirectAfterLogin) are required" },
                { status: 400 }
            );
        }

        const appExists = await App.findOne({ appName, appID: { $ne: appID } });

        if (appExists) {
            return NextResponse.json(
                { message: "This app name is already registered in our system" },
                { status: 400 }
            );
        }

        const updatedApp = await App.findOneAndUpdate(
            { appID },
            { appName, redirectAfterLogin },
            { new: true }
        );

        if (!updatedApp) {
            return NextResponse.json(
                { message: "App not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { message: "App updated successfully", app: updatedApp },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error in api/app/update: ", error);
        return NextResponse.json(
            { error: (error as Error).message || "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
