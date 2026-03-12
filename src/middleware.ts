import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import axios from 'axios';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if(path === "/"){
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = request.cookies.get("token")?.value || "";
  let data = {
    userType: "",
    appName: ""
  };

  if (token) {
    try {
      const response = await axios.post(`${request.nextUrl.origin}/api/auth/token`, {}, {
        headers: { Cookie: `token=${token}` },
      });
      
      data = response.data.data;
    } catch (error) {
      console.error("Error fetching JWT data:");
    }
  }

  const match = path.match(/^\/([^\/]+)\/(login|signup|profile)$/);
  const appName = match ? match[1] : null;

  if (path === "/login" || path === "/signup") {
    if (token) {
      if(data.userType === "user"){
        return NextResponse.redirect(new URL(`/${data.appName}/profile`, request.url));
      }else if(data.userType === "developer"){
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next(); // Allow access to login/signup if no token
  }

  if (path === "/dashboard") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token && data.userType === "user"){
      return NextResponse.redirect(new URL(`/${data.appName}/profile`, request.url));
    }else if (token && data.userType === "developer"){
      return NextResponse.next();
    }
  }

  if (appName && (path.endsWith("/login") || path.endsWith("/signup"))) {
    if (token && data.userType === "user") {
      return NextResponse.redirect(new URL(`/${data.appName}/profile`, request.url));
    }
    return NextResponse.next();
  }

  if (appName && path.endsWith("/profile")) {
    if (!token || (token && data.userType === "developer")) {
      return NextResponse.redirect(new URL(`/${appName}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/profile',
    '/dashboard',
    '/:appName*/login',
    '/:appName*/signup',
    '/:appName*/profile',
  ],
  runtime: 'nodejs',
}
