import jwt from "jsonwebtoken";

export type Session = { sub: string; role: "BUYER"|"INVESTOR"|"ADMIN"; iat?: number; exp?: number };
const COOKIE = "gsg_auth";
const SECRET = process.env.AUTH_SECRET || "dev-secret";

export function signSession(role: Session["role"], sub = "anonymous", maxAgeSeconds = 60*60*24*7) {
  const token = jwt.sign({ sub, role }, SECRET, { expiresIn: maxAgeSeconds });
  return token;
}

export function verifySession(token: string | undefined): Session | null {
  if (!token) return null;
  try { return jwt.verify(token, SECRET) as Session; } catch { return null; }
}

export { COOKIE };






