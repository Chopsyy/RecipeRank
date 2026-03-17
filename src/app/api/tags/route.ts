import { readData } from "@/lib/blob";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.tags);
}
