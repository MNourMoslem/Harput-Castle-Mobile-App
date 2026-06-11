import type { ImageSourcePropType } from 'react-native';

export interface GalleryImageItem {
  id: string;
  source: ImageSourcePropType;
  thumbnailSource: ImageSourcePropType;
  cacheKey: string;
  uploadedBy?: string | null;
  isOwn?: boolean;
}

export interface LoadImagesParams {
  cursor?: string | null;
  batchSize?: number;
  mineOnly?: boolean;
  currentUserId?: string | null;
}

export interface LoadImagesResult {
  items: GalleryImageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GalleryFeedSnapshot {
  images: GalleryImageItem[];
  cursor: string | null;
  hasMore: boolean;
}