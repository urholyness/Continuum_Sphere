import { NextResponse } from "next/server";
import { signSession, COOKIE } from "@/lib/auth";

export async function POST(req: Request){
  const { role, code, next, username, password } = await req.json();

  // Admin: username/password via env ADMIN_PASS
  if (role === "ADMIN") {
    const pass = process.env.ADMIN_PASS || "";
    if (username === "admin" && password && password === pass) {
      const token = signSession("ADMIN", username);
      const res = NextResponse.json({ ok: true, next: next || "/admin" });
      res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*7 });
      return res;
    }
    return NextResponse.json({ message: "Invalid admin credentials" }, { status: 401 });
  }

  // Basic test user for BUYER/INVESTOR
  if (username && password) {
    if (username === "zakayo" && password === "amanamnagani") {
      const token = signSession(role === "INVESTOR" ? "INVESTOR" : "BUYER", username);
      const res = NextResponse.json({ ok: true, next });
      res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*7 });
      return res;
    }
  }

  // Invite-code flow (optional)
  const want = role === "INVESTOR" ? process.env.INVITE_CODE_INVESTORS : process.env.INVITE_CODE_BUYERS;
  if (!want || code !== want) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  const token = signSession(role, "invite");
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*7 });
  return res;
}






