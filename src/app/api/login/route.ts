import { NextResponse } from "next/server";
import { signSession, COOKIE } from "@/lib/auth";

export async function POST(req: Request){
  const { role, code, next } = await req.json();
  const want = role === "INVESTOR" ? process.env.INVITE_CODE_INVESTORS : process.env.INVITE_CODE_BUYERS;
  if (!want || code !== want) {
    return NextResponse.json({ message: "Invalid invite code" }, { status: 401 });
  }
  const token = signSession(role, "invite");
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*7 });
  return res;
}






