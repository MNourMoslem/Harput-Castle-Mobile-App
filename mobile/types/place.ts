export type PlaceCategory =
  | 'tower'
  | 'gate'
  | 'mosque'
  | 'church'
  | 'cistern'
  | 'viewpoint'
  | 'ruins'
  | 'palace'
  | 'cemetery'
  | 'archaeological';

/**
 * Unified structure powering every place card in the list.
 * Each place folder has one of these in /en/meta.json and /tr/meta.json.
 */
export interface PlaceMeta {
  /** Unique identifier — matches folder name (place1, place2, …) */
  id: string;
  /** URL-friendly slug */
  slug: string;
  /** Localized display name */
  name: string;
  /** One-line teaser shown on the card — localized */
  shortDescription: string;
  /** Localized location label shown below the card title */
  locationLabel: string;
  /** Key into the app image registry (resolved to require()) */
  imageAsset: string;
  /** Approximate walking distance from the castle entrance — localized units */
  distance: string;
  /** Average visitor rating 0–5 */
  rating: number;
  /** Whether the user has saved this place as a favourite */
  isFavorite: boolean;
  /** Whether the user has physically visited this place */
  visited: boolean;
  /** Broad category — used for filtering and icon selection */
  category: PlaceCategory;
  /** Localized tags for search and filtering */
  tags: string[];
  /** Human-readable opening hours */
  openingHours: string;
  /** Localized entry fee string */
  entryFee: string;
  /** GPS coordinates for future interactive map integration */
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * place.json has no mandated shape — each place defines its own content.
 * Typed loosely so any valid JSON structure is accepted.
 */
export type PlaceDetail = Record<string, unknown>;
