import { del, get, list, put } from "@vercel/blob";
import type { Recipe } from "@/types/Recipe";

export interface DataStore {
  recipes: Recipe[];
  tags: string[];
}

const BLOB_FILENAME = "data/recipes.json";

export async function readData(): Promise<DataStore> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { recipes: [], tags: [] };
  }
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length === 0) return { recipes: [], tags: [] };
    const result = await get(blobs[0].url, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return { recipes: [], tags: [] };
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as DataStore;
    if (!parsed.tags) parsed.tags = [];
    return parsed;
  } catch {
    return { recipes: [], tags: [] };
  }
}

export async function writeData(data: DataStore): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function deleteBlob(url: string): Promise<void> {
  if (url.includes(".blob.vercel-storage.com")) {
    await del(url);
  }
}
