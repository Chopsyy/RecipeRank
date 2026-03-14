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
  const { score, user: ratingUser } = body;

  if (typeof score !== "number" || score < 1 || score > 10)
    return NextResponse.json(
      { error: "Invalid score (1-10)" },
      { status: 400 },
    );
  if (ratingUser !== "me" && ratingUser !== "gf")
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  const data = await readData();
  const recipe = data.recipes.find((r) => r.id === id);
  if (!recipe)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newRating = {
    id: crypto.randomUUID(),
    score,
    user: ratingUser as "me" | "gf",
    createdAt: new Date().toISOString(),
  };
  recipe.ratings.push(newRating);
  await writeData(data);

  return NextResponse.json(newRating, { status: 201 });
}
