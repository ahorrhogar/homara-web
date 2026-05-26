import "server-only";

import { db } from "@/lib/db";
import { deleteFromR2, isR2Url } from "@/lib/r2";

/**
 * Delete an R2 object only if no DB row still points at it. Content-hash
 * filenames mean one object can back several rows (e.g. a shared merchant
 * image across products), so a blind delete would break the survivors.
 */
export async function deleteR2ImageIfUnreferenced(url: string | null | undefined): Promise<void> {
  if (!url || !isR2Url(url)) return;
  const [images, categories, brands, merchants, articles] = await Promise.all([
    db.productImage.count({ where: { url } }),
    db.category.count({ where: { imageUrl: url } }),
    db.brand.count({ where: { logoUrl: url } }),
    db.merchant.count({ where: { logoUrl: url } }),
    db.editorialArticle.count({ where: { coverImage: url } }),
  ]);
  if (images + categories + brands + merchants + articles === 0) {
    await deleteFromR2(url);
  }
}

/**
 * Clean up an image that an upsert just replaced. No-op when the URL is
 * unchanged — keeps the "delete the old one on change" invariant in one place
 * so a new entity type can't forget half of it and leak R2 objects.
 */
export async function cleanupReplacedImage(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
): Promise<void> {
  if (previousUrl && previousUrl !== nextUrl) {
    await deleteR2ImageIfUnreferenced(previousUrl);
  }
}
