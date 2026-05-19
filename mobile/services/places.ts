import type { PlaceMeta } from '@/types/place';
import type { SupportedLocale } from '@/services/i18n';
import {
  getPlacesMeta as getRegistryPlacesMeta,
  getPlaceData as getRegistryPlaceData,
} from '@/services/contentRegistry';

/** Returns the locale-appropriate metadata list for all places. */
export function getPlacesMeta(locale: SupportedLocale): PlaceMeta[] {
  return getRegistryPlacesMeta(locale);
}

/**
 * Returns the locale-appropriate place.json content for a specific place.
 * Falls back to English if the locale is not found.
 */
export function getPlaceData<T>(placeId: string, locale: SupportedLocale): T;
export function getPlaceData<T>(placeId: string, locale: SupportedLocale): T {
  return getRegistryPlaceData<T>(placeId, locale);
}

/**
 * Total number of registered places — always dynamic.
 * Add entries above and this updates everywhere automatically.
 */
export function getTotalPlaces(): number {
  return getRegistryPlacesMeta('en').length;
}

/** Returns how many places the user has marked as visited. */
export function getVisitedCount(locale: SupportedLocale = 'en'): number {
  return getRegistryPlacesMeta(locale).filter(
    (p) => p.visited,
  ).length;
}
