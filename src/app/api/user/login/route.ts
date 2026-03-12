import { connectToMongo } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import App from "@/models/appModel";
import crypto from "crypto";

connectToMongo();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password, appName} = reqBody;
    const userType = "user";

    const app = await App.findOne({ appName }).collation({ locale: 'en', strength: 2 });;
    if (!app) {
        return NextResponse.json(
            { error: "App does not exist." },
            { status: 400 }
        );
    }

    const user = await User.findOne({ email, appID: app.appID });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { message: "check your credentials" },
        { status: 400 }
      );
    }
 
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before loggin" },
        { status: 401 }
      );
    }

    // Generate JWT Token
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
      appName,
      userType,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const clientTokenData = {
      username: user.username,
      email: user.email,
      appName,
    };

    const clientToken = jwt.sign(clientTokenData, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const response = new Response(
      JSON.stringify({
        message: `${userType} logged in successfully`,
        success: true,
        token, 
        redirectAfterLogin: `${app.redirectAfterLogin}?token=${clientToken}` 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
    
    // Clear any existing token
    // response.headers.append(
    //   "Set-Cookie",
    //   `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
    // );

    // // Set new token
    // response.headers.append(
    //   "Set-Cookie",
    //   `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${
    //     process.env.NODE_ENV === "production" ? "Secure" : ""
    //   }`
    // );

    return response;
  } catch (error) {
    console.log("Error in users/login : ", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}