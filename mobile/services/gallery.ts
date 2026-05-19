import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  GalleryImageItem,
  LoadImagesParams,
  LoadImagesResult,
} from '@/types/gallery';
import { resolveImage, getAllMediaImages } from '@/constants/assets';
import { getPlacesMeta } from '@/services/places';

const GALLERY_PAGE_CACHE_KEY = 'gallery_page_cache_v7';
const DEFAULT_BATCH_SIZE = 50;

const pageCache = new Map<string, LoadImagesResult>();

let didHydrateCache = false;
let hydratePromise: Promise<void> | null = null;

function getGalleryImages(): GalleryImageItem[] {
  try {
    const allMediaImages = getAllMediaImages();
    return allMediaImages.map((source, index) => {
      return {
        id: `gallery-image-media-${index}`,
        source,
        thumbnailSource: source,
        cacheKey: `gallery-image-media-${index}`,
      };
    });
  } catch (error) {
    return [];
  }
}

function getPageCacheKey(cursor: string | null, batchSize: number) {
  return `${cursor ?? 'start'}:${batchSize}`;
}

async function hydrateCache() {
  if (didHydrateCache) {
    return;
  }

  if (!hydratePromise) {
    hydratePromise = AsyncStorage.getItem(GALLERY_PAGE_CACHE_KEY)
      .then((stored) => {
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as Record<string, LoadImagesResult>;

        Object.entries(parsed).forEach(([key, value]) => {
          pageCache.set(key, value);
        });
      })
      .catch(() => {
        pageCache.clear();
      })
      .finally(() => {
        didHydrateCache = true;
        hydratePromise = null;
      });
  }

  await hydratePromise;
}

async function persistCache() {
  const serialized = Object.fromEntries(pageCache.entries());
  await AsyncStorage.setItem(GALLERY_PAGE_CACHE_KEY, JSON.stringify(serialized));
}

export async function clearGalleryCache() {
  pageCache.clear();
  didHydrateCache = false;
  hydratePromise = null;
  await AsyncStorage.removeItem(GALLERY_PAGE_CACHE_KEY);
}

function buildPage(cursor: string | null, batchSize: number): LoadImagesResult {
  const allImages = getGalleryImages();
  const startIndex = cursor ? Number(cursor) : 0;
  const safeStartIndex = Number.isFinite(startIndex) ? startIndex : 0;
  const nextIndex = Math.min(safeStartIndex + batchSize, allImages.length);
  const items = allImages.slice(safeStartIndex, nextIndex);
  const hasMore = nextIndex < allImages.length;

  return {
    items,
    nextCursor: hasMore ? String(nextIndex) : null,
    hasMore,
  };
}

export async function loadImages(
  params: LoadImagesParams = {},
): Promise<LoadImagesResult> {
  const cursor = params.cursor ?? null;
  const batchSize = params.batchSize ?? DEFAULT_BATCH_SIZE;

  await hydrateCache();

  const cacheKey = getPageCacheKey(cursor, batchSize);
  const cachedPage = pageCache.get(cacheKey);

  if (cachedPage) {
    return cachedPage;
  }

  const nextPage = buildPage(cursor, batchSize);

  pageCache.set(cacheKey, nextPage);
  await persistCache();

  return nextPage;
}