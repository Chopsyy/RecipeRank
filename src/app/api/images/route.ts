import { get } from "@vercel/blob";
import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySessionValue(sessionCookie);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url");
  if (!blobUrl || !blobUrl.includes(".blob.vercel-storage.com"))
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });

  const result = await get(blobUrl, { access: "private" });
  if (!result || result.statusCode !== 200)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
    },
  });
}
