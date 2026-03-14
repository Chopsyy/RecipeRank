import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie) return NextResponse.json({ user: null });
  const user = await verifySessionValue(sessionCookie);
  return NextResponse.json({ user });
}
