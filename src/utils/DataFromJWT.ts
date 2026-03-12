import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export default async function DataFromJWT(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value || "";
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decodedToken !== "string" && "id" in decodedToken) {
            return decodedToken;
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.log("An unknown error occurred");
    }
}