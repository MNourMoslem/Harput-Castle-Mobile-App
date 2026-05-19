import type { SupportedLocale } from '@/services/i18n';

export interface ContentManifest {
  version: number;
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  mediaBasePath?: string;
}

export interface ContentPlaceMeta {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  locationLabel: string;
  imageAsset: string;
  distance: string;
  rating: number;
  isFavorite: boolean;
  visited: boolean;
  category: string;
  tags: string[];
  openingHours: string;
  entryFee: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
