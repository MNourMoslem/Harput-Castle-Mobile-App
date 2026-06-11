import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearGalleryCache,
  getCachedFeed,
  loadImages,
  saveFeedCache,
} from '@/services/gallery';
import type { GalleryImageItem } from '@/types/gallery';

const GALLERY_BATCH_SIZE = 9;

interface PaginatedGalleryState {
  images: GalleryImageItem[];
  cursor: string | null;
  hasMore: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

interface UsePaginatedGalleryOptions {
  mineOnly?: boolean;
  currentUserId?: string | null;
}

interface UsePaginatedGalleryResult extends PaginatedGalleryState {
  loadNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_STATE: PaginatedGalleryState = {
  images: [],
  cursor: null,
  hasMore: true,
  isInitialLoading: true,
  isLoadingMore: false,
  isRefreshing: false,
};

export function usePaginatedGallery(
  options: UsePaginatedGalleryOptions = {},
): UsePaginatedGalleryResult {
  const { mineOnly = false, currentUserId = null } = options;

  const [state, setState] = useState<PaginatedGalleryState>(EMPTY_STATE);

  const stateRef = useRef(state);
  stateRef.current = state;

  const mineOnlyRef = useRef(mineOnly);
  mineOnlyRef.current = mineOnly;

  const persistFeed = useCallback(
    (next: Pick<PaginatedGalleryState, 'images' | 'cursor' | 'hasMore'>) => {
      saveFeedCache(mineOnlyRef.current, next);
    },
    [],
  );

  const loadPage = useCallback(
    async ({
      nextCursor,
      replace,
      resetCache,
    }: {
      nextCursor?: string | null;
      replace?: boolean;
      resetCache?: boolean;
    } = {}) => {
      if (resetCache) {
        await clearGalleryCache(mineOnlyRef.current);
      }

      const page = await loadImages({
        cursor: nextCursor ?? null,
        batchSize: GALLERY_BATCH_SIZE,
        mineOnly: mineOnlyRef.current,
        currentUserId,
      });

      setState((current) => {
        const knownIds = replace
          ? new Set<string>()
          : new Set(current.images.map((item) => item.id));
        const nextItems = page.items.filter((item) => !knownIds.has(item.id));
        const images = replace ? page.items : [...current.images, ...nextItems];
        const nextState = {
          ...current,
          images,
          cursor: page.nextCursor,
          hasMore: page.hasMore,
        };
        persistFeed({
          images: nextState.images,
          cursor: nextState.cursor,
          hasMore: nextState.hasMore,
        });
        return nextState;
      });
    },
    [currentUserId, persistFeed],
  );

  const loadNextPage = useCallback(async () => {
    const { isLoadingMore, hasMore, cursor, isInitialLoading } = stateRef.current;

    if (isLoadingMore || !hasMore) {
      return;
    }

    setState((s) => ({ ...s, isLoadingMore: true }));

    try {
      await loadPage({ nextCursor: cursor, replace: isInitialLoading && cursor === null });
    } finally {
      setState((s) => ({ ...s, isLoadingMore: false, isInitialLoading: false }));
    }
  }, [loadPage]);

  const refresh = useCallback(async () => {
    if (stateRef.current.isRefreshing) {
      return;
    }

    setState((s) => ({ ...s, isRefreshing: true }));

    try {
      await loadPage({ nextCursor: null, replace: true, resetCache: true });
    } finally {
      setState((s) => ({ ...s, isRefreshing: false, isInitialLoading: false }));
    }
  }, [loadPage]);

  useEffect(() => {
    const cached = getCachedFeed(mineOnly);
    if (cached) {
      setState({
        images: cached.images,
        cursor: cached.cursor,
        hasMore: cached.hasMore,
        isInitialLoading: false,
        isLoadingMore: false,
        isRefreshing: false,
      });
      return;
    }

    setState({ ...EMPTY_STATE });
    void loadPage({ nextCursor: null, replace: true }).finally(() => {
      setState((s) => ({ ...s, isInitialLoading: false }));
    });
  }, [mineOnly, currentUserId, loadPage]);

  return { ...state, loadNextPage, refresh };
}
