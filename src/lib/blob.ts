import { del, get, list, put } from "@vercel/blob";
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
    const result = await get(blobs[0].url, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return { recipes: [] };
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as DataStore;
  } catch {
    return { recipes: [] };
  }
}

export async function writeData(data: DataStore): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function deleteBlob(url: string): Promise<void> {
  if (url.includes(".blob.vercel-storage.com")) {
    await del(url);
  }
}
