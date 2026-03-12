import { connectToMongo } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Dev from "@/models/devModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import axios from "axios";
import App from "@/models/appModel";

connectToMongo();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password, appName } = reqBody;
    const emailType = "USER_VERIFY";
    
    if (!username || !email || !password || !appName) {
      console.log("Missing fields.");
      return NextResponse.json(
        { error: "All fields (username, email, password, appName) are required." },
        { status: 400 }
      );
    }

    // Find the app using appName (case-insensitive)
    const validApp = await App.findOne({ appName }).collation({ locale: "en", strength: 2 });
    if (!validApp) {
      console.log("App does not exist.");
      return NextResponse.json(
        { error: "App does not exist." },
        { status: 400 }
      );
    }

    // Check if the combination of username and email already exists for this appID
    // (Even though we use indexes for uniqueness, we still do a quick check here if desired)
    const existingUser = await User.findOne({ username, email, appID: validApp.appID });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this username and email already exists in this app." },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the user with the appID from the validApp document
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      appID: validApp.appID,
    });

    await newUser.save();

    // Send verification email
    const emailRes = await axios.post(`${process.env.DOMAIN}/api/auth/sendMail`, {
      email,
      emailType,
      appName,
    });
    
    let msg = "User created successfully.";
    if (emailRes.status === 201) {
      msg += " Email not sent.";
    }

    return NextResponse.json(
      {
        message: msg,
        success: true,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error in users/signup:", error);
    if (error.code === 11000) {
      // Inspect the duplicate key error to determine which field is duplicated
      const keyPattern = error.keyPattern;
      if (keyPattern) {
        if (keyPattern.username && keyPattern.email) {
          return NextResponse.json(
            { error: "Both username and email are already in use in this app." },
            { status: 400 }
          );
        } else if (keyPattern.username) {
          return NextResponse.json(
            { error: "Username is already taken in this app." },
            { status: 400 }
          );
        } else if (keyPattern.email) {
          return NextResponse.json(
            { error: "Email is already in use in this app." },
            { status: 400 }
          );
        }
      }
      return NextResponse.json(
        { error: "Duplicate entry found." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
