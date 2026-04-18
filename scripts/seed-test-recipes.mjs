// Run with: node scripts/seed-test-recipes.mjs
// Requires BLOB_READ_WRITE_TOKEN in .env

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, "../.env");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
}

const { list, get, put } = await import("@vercel/blob");

const BLOB_FILENAME = "data/recipes.json";

async function readData() {
  const { blobs } = await list({ prefix: BLOB_FILENAME });
  if (blobs.length === 0) return { recipes: [], tags: [] };
  const result = await get(blobs[0].url, {
    access: "private",
    useCache: false,
  });
  const text = await new Response(result.stream).text();
  const parsed = JSON.parse(text);
  if (!parsed.tags) parsed.tags = [];
  return parsed;
}

async function writeData(data) {
  await put(BLOB_FILENAME, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

const testRecipes = [
  {
    id: crypto.randomUUID(),
    title: "Test Recipe: Simple Pasta",
    description:
      "<p>This is a <strong>test recipe</strong> for development purposes. It should be deleted before going live.</p><ul><li>Boil pasta</li><li>Add sauce</li><li>Serve hot</li></ul>",
    ingredients: [
      { name: "Pasta", quantity: "200", unit: "g" },
      { name: "Tomato Sauce", quantity: "150", unit: "ml" },
      { name: "Parmesan", quantity: "30", unit: "g" },
    ],
    imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800",
    createdAt: new Date().toISOString(),
    userId: "me",
    tags: ["test", "pasta", "quick"],
    ratings: [],
    comments: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Test Recipe: Banana Smoothie",
    description:
      "<p>A <em>test smoothie recipe</em> used for UI testing. <s>Not a real recipe.</s> Tagged as <strong>test</strong>.</p><ol><li>Peel banana</li><li>Blend with milk</li><li>Enjoy</li></ol>",
    ingredients: [
      { name: "Banana", quantity: "2", unit: "Stück" },
      { name: "Milk", quantity: "200", unit: "ml" },
      { name: "Honey", quantity: "1", unit: "EL" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1638176066982-4b882e2e47ac?w=800",
    createdAt: new Date().toISOString(),
    userId: "me",
    tags: ["test", "smoothie", "breakfast"],
    ratings: [],
    comments: [],
  },
];

const data = await readData();
data.recipes.push(...testRecipes);

const tagSet = new Set(data.tags);
for (const recipe of testRecipes) {
  for (const tag of recipe.tags) tagSet.add(tag);
}
data.tags = Array.from(tagSet).sort();

await writeData(data);
console.log(`✓ Added 2 test recipes:`);
for (const r of testRecipes) {
  console.log(`  - ${r.title} (id: ${r.id})`);
}
