import type { LoadImagesParams, LoadImagesResult } from '@/types/gallery';
import { fetchGalleryPage } from '@/services/galleryApi';

const DEFAULT_BATCH_SIZE = 9;

export async function clearGalleryCache() {
  // Remote gallery — nothing to clear locally
}

export async function loadImages(
  params: LoadImagesParams = {},
): Promise<LoadImagesResult> {
  const cursor = params.cursor ?? null;
  const batchSize = params.batchSize ?? DEFAULT_BATCH_SIZE;
  const mineOnly = params.mineOnly ?? false;
  const currentUserId = params.currentUserId ?? null;

  return fetchGalleryPage(cursor, batchSize, mineOnly, currentUserId);
}
