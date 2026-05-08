import { put, del, type PutBlobResult } from "@vercel/blob";

export type BlobFolder = "products" | "brands" | "categories" | "merchants";

const token = process.env.BLOB_READ_WRITE_TOKEN;

function ensureToken() {
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Configure Vercel Blob before uploading assets.",
    );
  }
  return token;
}

export async function putImage(
  folder: BlobFolder,
  filename: string,
  body: Blob | ArrayBuffer | ReadableStream | Buffer,
  contentType?: string,
): Promise<PutBlobResult> {
  return put(`${folder}/${filename}`, body, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    token: ensureToken(),
  });
}

export async function deleteImage(url: string): Promise<void> {
  await del(url, { token: ensureToken() });
}
