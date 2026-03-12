import {connectToMongo} from "@/dbConfig/dbConfig"
import User from "@/models/userModel";
import { NextRequest, NextResponse } from 'next/server'
import DataFromJWT from "@/utils/DataFromJWT";

connectToMongo();

export async function GET(request: NextRequest){

    try {
        const data = await DataFromJWT(request);
        const userId = data.id;
        const user = await User.findOne({_id: userId}).select("-password");
        if(!user) {
            return NextResponse.json({error: "User does not exist"}, {status: 400})
        }
        return NextResponse.json({message: "User Found", data: user}, {status: 200});

    } catch (error) {
        console.log("Error in users/profile : " + error);
        return NextResponse.json({error: (error as Error).message}, {status: 500})
    }
}       