import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";


export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow all origins (or specify your client URL)
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, message: "Token missing" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded) {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid token" }),
        {
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, user: decoded }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return new Response(
      JSON.stringify({ valid: false, message: "Token verification failed" }),
      {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
