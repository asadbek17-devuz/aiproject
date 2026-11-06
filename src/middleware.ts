import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Middleware is only a coarse first gate. Every page/action/API performs its own
// server-side authorization (requireUser / requireRole / requireActiveAccess).
export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/lessons/:path*",
    "/classroom/:path*",
    "/homework/:path*",
    "/subscription/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/mentor-demo/:path*",
    "/profile/:path*",
  ],
};
