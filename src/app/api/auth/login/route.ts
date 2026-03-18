import { COOKIE_NAME, createSessionValue, verifyPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body ?? {};

  if (typeof email !== "string" || typeof password !== "string")
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const user = verifyPassword(email, password);
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const sessionValue = await createSessionValue(user);
  const response = NextResponse.json({ user });
  response.cookies.set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
