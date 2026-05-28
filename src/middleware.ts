import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "inbox_copilot_auth";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow health check without auth
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // Check for ?key= param to set auth cookie
  const key = searchParams.get("key");
  if (key && key === process.env.AUTH_TOKEN) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("key");
    if (pathname === "/") url.pathname = "/inbox";
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE_NAME, key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    return response;
  }

  // Check auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (!authCookie || authCookie.value !== process.env.AUTH_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Redirect / to /inbox
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
