import type {
  GalleryImageItem,
  GalleryFeedSnapshot,
  LoadImagesParams,
  LoadImagesResult,
} from '@/types/gallery';
import { fetchGalleryPage } from '@/services/galleryApi';

const DEFAULT_BATCH_SIZE = 9;

type GalleryMode = 'all' | 'mine';

function getMode(mineOnly: boolean): GalleryMode {
  return mineOnly ? 'mine' : 'all';
}

function pageCacheKey(cursor: string | null, batchSize: number): string {
  return `${cursor ?? 'start'}:${batchSize}`;
}

const pageCaches: Record<GalleryMode, Map<string, LoadImagesResult>> = {
  all: new Map(),
  mine: new Map(),
};

const feedSnapshots: Record<GalleryMode, GalleryFeedSnapshot | null> = {
  all: null,
  mine: null,
};

export function getCachedFeed(mineOnly: boolean): GalleryFeedSnapshot | null {
  return feedSnapshots[getMode(mineOnly)];
}

export function saveFeedCache(
  mineOnly: boolean,
  snapshot: GalleryFeedSnapshot,
): void {
  feedSnapshots[getMode(mineOnly)] = snapshot;
}

export async function clearGalleryCache(mineOnly?: boolean): Promise<void> {
  if (mineOnly === undefined) {
    pageCaches.all.clear();
    pageCaches.mine.clear();
    feedSnapshots.all = null;
    feedSnapshots.mine = null;
    return;
  }

  const mode = getMode(mineOnly);
  pageCaches[mode].clear();
  feedSnapshots[mode] = null;
}

export async function loadImages(
  params: LoadImagesParams = {},
): Promise<LoadImagesResult> {
  const cursor = params.cursor ?? null;
  const batchSize = params.batchSize ?? DEFAULT_BATCH_SIZE;
  const mineOnly = params.mineOnly ?? false;
  const currentUserId = params.currentUserId ?? null;
  const mode = getMode(mineOnly);

  const cacheKey = pageCacheKey(cursor, batchSize);
  const cachedPage = pageCaches[mode].get(cacheKey);
  if (cachedPage) {
    return cachedPage;
  }

  const page = await fetchGalleryPage(
    cursor,
    batchSize,
    mineOnly,
    currentUserId,
  );

  pageCaches[mode].set(cacheKey, page);
  return page;
}
