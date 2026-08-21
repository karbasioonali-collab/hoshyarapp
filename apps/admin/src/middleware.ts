import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const adminUserId = await verifyAdminToken(token);

  if (!adminUserId && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  if (adminUserId && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
