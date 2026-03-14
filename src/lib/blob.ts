import { del, list, put } from "@vercel/blob";
import type { Recipe } from "@/types/Recipe";

export interface DataStore {
  recipes: Recipe[];
}

const BLOB_FILENAME = "data/recipes.json";

export async function readData(): Promise<DataStore> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { recipes: [] };
  }
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length === 0) return { recipes: [] };
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return { recipes: [] };
    return (await res.json()) as DataStore;
  } catch {
    return { recipes: [] };
  }
}

export async function writeData(data: DataStore): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function deleteBlob(url: string): Promise<void> {
  if (url.includes(".blob.vercel-storage.com")) {
    await del(url);
  }
}
