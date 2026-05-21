import "server-only";

import { createHash } from "node:crypto";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

export type R2Folder = "products" | "brands" | "categories" | "merchants" | "articles";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "products";
const PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

const MAX_EDGE_PX = 1600;
const WEBP_QUALITY = 82;
const FETCH_TIMEOUT_MS = 8000;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 no está configurado: define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.",
    );
  }
  if (!PUBLIC_BASE_URL) {
    throw new Error("R2_PUBLIC_BASE_URL no está definido (ej. https://cdn.homara.es).");
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    });
  }
  return cachedClient;
}

/** True for URLs we host on our own R2 CDN. */
export function isR2Url(url: string): boolean {
  return Boolean(PUBLIC_BASE_URL) && url.startsWith(`${PUBLIC_BASE_URL}/`);
}

/**
 * Re-encode to WebP and cap the long edge at 1600px. SVGs pass through
 * untouched (logos are commonly vector and rasterizing them is lossy).
 */
async function normalize(
  bytes: Buffer,
  sourceContentType: string,
): Promise<{ body: Buffer; ext: string; contentType: string }> {
  if (sourceContentType.toLowerCase().includes("svg")) {
    return { body: bytes, ext: "svg", contentType: "image/svg+xml" };
  }
  const body = await sharp(bytes)
    .rotate()
    .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  return { body, ext: "webp", contentType: "image/webp" };
}

/**
 * Upload image bytes to R2 under a content-hash key and return the public
 * cdn.homara.es URL. Identical bytes dedupe to a single object.
 */
export async function uploadToR2(
  folder: R2Folder,
  bytes: Buffer | Uint8Array,
  sourceContentType: string,
): Promise<string> {
  const input = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const { body, ext, contentType } = await normalize(input, sourceContentType || "");
  const hash = createHash("sha256").update(body).digest("hex");
  const key = `${folder}/${hash}.${ext}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${PUBLIC_BASE_URL}/${key}`;
}

/** Delete a single object by its public URL. No-op for non-R2 URLs. */
export async function deleteFromR2(url: string): Promise<void> {
  if (!isR2Url(url)) return;
  const key = url.slice(PUBLIC_BASE_URL.length + 1);
  if (!key) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // R2 cleanup must never block the calling mutation.
  }
}

export interface RehostResult {
  url: string;
  rehosted: boolean;
  warning?: string;
}

/**
 * Download a remote image and store it in R2. On any failure (network,
 * non-2xx, non-image, oversize, R2 not configured) returns the original URL
 * with a warning so callers can degrade gracefully instead of breaking.
 */
export async function rehostRemoteImage(url: string, folder: R2Folder): Promise<RehostResult> {
  const trimmed = url.trim();
  if (!trimmed) return { url: trimmed, rehosted: false, warning: "URL vacía" };
  if (isR2Url(trimmed)) return { url: trimmed, rehosted: true };
  if (!/^https?:\/\//i.test(trimmed)) {
    return { url: trimmed, rehosted: false, warning: "URL no es http(s)" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(trimmed, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HomaraBot/1.0; +https://homara.es)",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) {
      return { url: trimmed, rehosted: false, warning: `descarga falló (HTTP ${res.status})` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) {
      return { url: trimmed, rehosted: false, warning: "respuesta vacía" };
    }
    if (buf.byteLength > MAX_SOURCE_BYTES) {
      return { url: trimmed, rehosted: false, warning: "imagen demasiado grande" };
    }
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const newUrl = await uploadToR2(folder, buf, contentType);
    return { url: newUrl, rehosted: true };
  } catch (error) {
    const warning = error instanceof Error ? error.message : "error desconocido al rehospedar";
    return { url: trimmed, rehosted: false, warning };
  } finally {
    clearTimeout(timeout);
  }
}
