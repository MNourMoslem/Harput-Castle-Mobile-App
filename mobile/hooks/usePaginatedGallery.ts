import { useCallback, useEffect, useRef, useState } from 'react';

import { clearGalleryCache, loadImages } from '@/services/gallery';
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

interface UsePaginatedGalleryResult extends PaginatedGalleryState {
  loadNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedGallery(): UsePaginatedGalleryResult {
  const [state, setState] = useState<PaginatedGalleryState>({
    images: [],
    cursor: null,
    hasMore: true,
    isInitialLoading: true,
    isLoadingMore: false,
    isRefreshing: false,
  });

  // Use refs so callbacks don't go stale without triggering re-renders
  const stateRef = useRef(state);
  stateRef.current = state;

  const didLoadInitialPage = useRef(false);

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
        await clearGalleryCache();
      }

      const page = await loadImages({
        cursor: nextCursor ?? null,
        batchSize: GALLERY_BATCH_SIZE,
      });

      setState((current) => {
        const knownIds = replace
          ? new Set<string>()
          : new Set(current.images.map((item) => item.id));
        const nextItems = page.items.filter((item) => !knownIds.has(item.id));
        return {
          ...current,
          images: replace ? page.items : [...current.images, ...nextItems],
          cursor: page.nextCursor,
          hasMore: page.hasMore,
        };
      });
    },
    [],
  );

  const loadNextPage = useCallback(async () => {
    const { isLoadingMore, hasMore, cursor } = stateRef.current;

    if (isLoadingMore || !hasMore) {
      return;
    }

    setState((s) => ({ ...s, isLoadingMore: true }));

    try {
      await loadPage({ nextCursor: cursor });
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
    if (didLoadInitialPage.current) {
      return;
    }

    didLoadInitialPage.current = true;
    loadNextPage();
  }, [loadNextPage]);

  return { ...state, loadNextPage, refresh };
}
