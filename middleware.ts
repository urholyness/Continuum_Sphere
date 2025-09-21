import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, COOKIE } from "./src/lib/auth";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const isProtected = path.startsWith("/trace") || path.startsWith("/ff-fund") || path.startsWith("/admin");
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/admin") && session.role !== "ADMIN") {
    url.pathname = "/login";
    url.searchParams.set("next", "/admin");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/trace/:path*", "/ff-fund/:path*", "/admin/:path*"],
};






