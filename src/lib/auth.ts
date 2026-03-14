// Uses Web Crypto API —
// compatible with Edge Runtime and Node.js 18+

export const COOKIE_NAME = "session";
export type AppUser = "me" | "gf";

async function getKey(): Promise<CryptoKey> {
  const secret =
    process.env.SESSION_SECRET ?? "dev-secret-change-in-production";
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionValue(user: AppUser): Promise<string> {
  const key = await getKey();
  const ts = Date.now().toString();
  const payload = `${user}.${ts}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${sigHex}`;
}

export async function verifySessionValue(
  value: string,
): Promise<AppUser | null> {
  if (!value) return null;
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const sigHex = value.slice(lastDot + 1);
  const payload = value.slice(0, lastDot);
  const firstDot = payload.indexOf(".");
  if (firstDot === -1) return null;
  const user = payload.slice(0, firstDot);
  const ts = payload.slice(firstDot + 1);

  if (user !== "me" && user !== "gf") return null;
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age > 7 * 24 * 60 * 60 * 1000) return null;

  try {
    const key = await getKey();
    const encoder = new TextEncoder();
    const sigBytes = new Uint8Array(
      (sigHex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payload),
    );
    if (!valid) return null;
  } catch {
    return null;
  }

  return user as AppUser;
}

export function verifyPassword(
  email: string,
  password: string,
): AppUser | null {
  if (
    email === process.env.USER_ME_EMAIL &&
    password === process.env.USER_ME_PASSWORD
  )
    return "me";
  if (
    email === process.env.USER_GF_EMAIL &&
    password === process.env.USER_GF_PASSWORD
  )
    return "gf";
  return null;
}
