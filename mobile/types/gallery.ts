import type { ImageSourcePropType } from 'react-native';

export interface GalleryImageItem {
  id: string;
  source: ImageSourcePropType;
  thumbnailSource: ImageSourcePropType;
  cacheKey: string;
}

export interface LoadImagesParams {
  cursor?: string | null;
  batchSize?: number;
}

export interface LoadImagesResult {
  items: GalleryImageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}