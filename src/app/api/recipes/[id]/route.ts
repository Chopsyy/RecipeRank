import { put } from "@vercel/blob";
import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { deleteBlob, readData, writeData } from "@/lib/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
  ],
  allowedAttributes: {},
};

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

export async function PUT(
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
  const data = await readData();
  const recipeIndex = data.recipes.findIndex((r) => r.id === id);
  if (recipeIndex === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const recipe = data.recipes[recipeIndex];
  if (recipe.userId !== user)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const rawDescription = formData.get("description") as string;
  const description = sanitizeHtml(rawDescription ?? "", ALLOWED_HTML);
  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const tagsRaw = formData.get("tags") as string | null;
  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];
  const imageFile = formData.get("image") as File | null;
  const imageUrlInput = formData.get("imageUrl") as string | null;

  let imageUrl: string | undefined = recipe.imageUrl;
  if (imageFile && imageFile.size > 0) {
    // Delete old blob before uploading new one
    if (recipe.imageUrl) await deleteBlob(recipe.imageUrl);
    const blob = await put(
      `images/${Date.now()}_${imageFile.name}`,
      imageFile,
      { access: "private" },
    );
    imageUrl = blob.url;
  } else if (imageUrlInput !== null) {
    imageUrl = imageUrlInput || undefined;
  }

  data.recipes[recipeIndex] = {
    ...recipe,
    title,
    description,
    ingredients,
    tags,
    imageUrl,
  };

  // Recompute global tag list
  const tagSet = new Set<string>();
  for (const r of data.recipes) {
    for (const tag of r.tags ?? []) tagSet.add(tag);
  }
  data.tags = Array.from(tagSet).sort();

  await writeData(data);
  return NextResponse.json(data.recipes[recipeIndex]);
}
