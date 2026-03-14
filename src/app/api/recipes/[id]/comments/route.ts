import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { readData, writeData } from "@/lib/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySessionValue(sessionCookie);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { comment } = body;

  if (!comment || typeof comment !== "string" || !comment.trim())
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });

  const data = await readData();
  const recipe = data.recipes.find((r) => r.id === id);
  if (!recipe)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newComment = {
    id: crypto.randomUUID(),
    comment: comment.trim(),
    user,
    createdAt: new Date().toISOString(),
  };
  recipe.comments.push(newComment);
  await writeData(data);

  return NextResponse.json(newComment, { status: 201 });
}
