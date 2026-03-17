import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { deleteBlob, readData, writeData } from "@/lib/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await readData();
  const recipe = data.recipes.find((r) => r.id === id);
  if (!recipe)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function DELETE(
  _request: Request,
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
  const data = await readData();
  const recipe = data.recipes.find((r) => r.id === id);
  if (!recipe)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (recipe.imageUrl) {
    await deleteBlob(recipe.imageUrl);
  }

  data.recipes = data.recipes.filter((r) => r.id !== id);
  // Recompute global tag list from remaining recipes to prune orphans
  const remainingTags = new Set<string>();
  for (const r of data.recipes) {
    for (const tag of r.tags ?? []) remainingTags.add(tag);
  }
  data.tags = Array.from(remainingTags).sort();
  await writeData(data);

  return new NextResponse(null, { status: 204 });
}
