import { connectToMongo } from '@/dbConfig/dbConfig';
import App from '@/models/appModel';
import Dev from '@/models/devModel';
import DataFromJWT from '@/utils/DataFromJWT';
import { NextRequest, NextResponse } from 'next/server';

connectToMongo()

export async function GET(request: NextRequest) {
    try {
        const data = await DataFromJWT(request);
        const userID = data.id;
        const user = await Dev.findOne({_id: userID});
        if (!user) {
            return NextResponse.json({message: "User not permited or not authenticated"}, {status: 400})
        }

        const apps = await App.find({developerID: userID});
        return NextResponse.json({ success: true, data: apps }, { status: 200 });

    } catch (error) {
        console.log("Error in app/fetchapp : ", error);
        return NextResponse.json({error: (error as Error).message}, {status: 500})
    }
}
