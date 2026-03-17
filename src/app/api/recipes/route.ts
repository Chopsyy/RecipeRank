import { put } from "@vercel/blob";
import { COOKIE_NAME, verifySessionValue } from "@/lib/auth";
import { readData, writeData } from "@/lib/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await readData();
  data.recipes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return NextResponse.json(data.recipes);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySessionValue(sessionCookie);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const tagsRaw = formData.get("tags") as string | null;
  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];
  const imageFile = formData.get("image") as File | null;
  const imageUrlInput = formData.get("imageUrl") as string | null;

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const blob = await put(
      `images/${Date.now()}_${imageFile.name}`,
      imageFile,
      {
        access: "private",
      },
    );
    imageUrl = blob.url;
  } else if (imageUrlInput) {
    imageUrl = imageUrlInput;
  }

  const newRecipe = {
    id: crypto.randomUUID(),
    title,
    description,
    ingredients,
    imageUrl,
    createdAt: new Date().toISOString(),
    userId: user,
    tags,
    ratings: [] as {
      id: string;
      score: number;
      user: "me" | "gf";
      createdAt: string;
    }[],
    comments: [] as {
      id: string;
      comment: string;
      user: string;
      createdAt: string;
    }[],
  };

  const data = await readData();
  data.recipes.push(newRecipe);
  // Merge new tags into global tag list
  const tagSet = new Set(data.tags);
  for (const tag of tags) tagSet.add(tag);
  data.tags = Array.from(tagSet).sort();
  await writeData(data);

  return NextResponse.json(newRecipe, { status: 201 });
}
