import type { HistoryEntry } from '@/types/history';
import type { SupportedLocale } from '@/services/i18n';
import {
  getHistoryList as getRegistryHistoryList,
  getHistoryEntry as getRegistryHistoryEntry,
} from '@/services/contentRegistry';

/** Returns all history entries sorted by sortOrder for the given locale. */
export function getHistoryList(locale: SupportedLocale): HistoryEntry[] {
  return getRegistryHistoryList(locale);
}

/** Returns a single history entry by slug, with English fallback. */
export function getHistoryEntry(slug: string, locale: SupportedLocale): HistoryEntry {
  return getRegistryHistoryEntry(slug, locale);
}
