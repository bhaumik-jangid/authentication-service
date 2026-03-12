import bcrypt from 'bcryptjs';
import {connectToMongo} from "@/dbConfig/dbConfig"
import App from "@/models/appModel";
import { NextRequest, NextResponse } from 'next/server'
import axios from "axios";
import DataFromJWT from "@/utils/DataFromJWT";
import Dev from "@/models/devModel";

connectToMongo();

export async function POST(request: NextRequest){
    try {
        const reqbody = await request.json()
        const {appName, redirectAfterLogin} = reqbody;
        
        const data = await DataFromJWT(request);
        const developerID = data?.id;
        const dev = await Dev.findOne({_id: developerID});

        const app = await App.findOne({appName}).collation({ locale: 'en', strength: 2 });
        if(app){
            return NextResponse.json({error: "App name already in use"}, {status: 400})
        }

        const crypto = require('crypto');
        const appID = crypto.randomBytes(16).toString('hex');

        const clientSecretPlain = crypto.randomBytes(32).toString("hex");
        const hashedSecret = await bcrypt.hash(clientSecretPlain, 10);

        const newApp = new App({
            appID,
            appName,
            developerID,
            clientSecret: hashedSecret,
            redirectAfterLogin
        })

        await newApp.save();

        dev.apps.push(newApp._id);
        await dev.save();

        await axios.post(`${process.env.DOMAIN}/api/auth/sendMail`,{developerID, email: dev.email, emailType: "APP_CREATED", appID, appName});
        return NextResponse.json({message: "App created successfully", success: true, clientSecret: clientSecretPlain}, {status: 200})

        
    } catch (error) {
        console.log("Error in app/register : ", error);
        return NextResponse.json({error: (error as Error).message}, {status: 500})
    }
}