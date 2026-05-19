import type { SupportedLocale } from '@/services/i18n';
import type { RawQuizQuestion } from '@/types/quiz';
import type { PlaceMeta } from '@/types/place';
import type { HistoryEntry } from '@/types/history';
import type { ContentManifest } from '@/types/content';

const contentContext = require.context('../data/content', true, /\.json$/);

function normalizeContextKey(path: string): string {
  const clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return clean.startsWith('./') ? clean : `./${clean}`;
}

function listContentKeys(prefix: string): string[] {
  const normalizedPrefix = normalizeContextKey(prefix).replace(/\/$/, '');
  return contentContext
    .keys()
    .filter((key: string) => key.startsWith(normalizedPrefix))
    .sort();
}

function loadJson<T>(path: string): T {
  const key = normalizeContextKey(path);
  const moduleValue = contentContext(key);
  return (moduleValue?.default ?? moduleValue) as T;
}

export function getContentManifest(): ContentManifest {
  return loadJson<ContentManifest>('manifest.json');
}

export function getContentLocale(locale: SupportedLocale): SupportedLocale {
  const manifest = getContentManifest();
  return manifest.supportedLocales.includes(locale)
    ? locale
    : manifest.defaultLocale;
}

export function getPlacesMeta(locale: SupportedLocale): PlaceMeta[] {
  const activeLocale = getContentLocale(locale);
  const metaKeys = listContentKeys(`${activeLocale}/places/meta/`);

  return metaKeys
    .map((key) => loadJson<PlaceMeta>(key))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getPlaceData<T>(placeId: string, locale: SupportedLocale): T {
  const activeLocale = getContentLocale(locale);
  const key = `${activeLocale}/places/detail/${placeId}.json`;

  try {
    return loadJson<T>(key);
  } catch {
    const fallbackLocale = getContentManifest().defaultLocale;
    return loadJson<T>(`${fallbackLocale}/places/detail/${placeId}.json`);
  }
}

export function getQuizPool(locale: SupportedLocale): RawQuizQuestion[] {
  const activeLocale = getContentLocale(locale);
  const questionKeys = listContentKeys(`${activeLocale}/quiz/questions/`);

  return questionKeys
    .map((key) => loadJson<RawQuizQuestion>(key))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getHistoryList(locale: SupportedLocale): HistoryEntry[] {
  const activeLocale = getContentLocale(locale);
  const keys = listContentKeys(`${activeLocale}/history/`);

  return keys
    .map((key) => loadJson<HistoryEntry>(key))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getHistoryEntry(slug: string, locale: SupportedLocale): HistoryEntry {
  const activeLocale = getContentLocale(locale);
  const key = `${activeLocale}/history/${slug}.json`;

  try {
    return loadJson<HistoryEntry>(key);
  } catch {
    const fallbackLocale = getContentManifest().defaultLocale;
    return loadJson<HistoryEntry>(`${fallbackLocale}/history/${slug}.json`);
  }
}
