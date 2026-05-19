export interface ParagraphSection {
  type: 'paragraph';
  text: string;
}

export interface QuoteSection {
  type: 'quote';
  text: string;
  attribution?: string;
}

export interface ImageSection {
  type: 'image';
  url: string;
  caption: string;
  attribution?: string;
}

export interface HeadingSection {
  type: 'heading';
  text: string;
}

export interface FactListSection {
  type: 'fact_list';
  items: string[];
}

export type HistorySection =
  | ParagraphSection
  | QuoteSection
  | ImageSection
  | HeadingSection
  | FactListSection;

/**
 * One chapter of the Harput Castle chronicle.
 * A single JSON file contains both the card meta and the full page content.
 */
export interface HistoryEntry {
  /** Unique identifier — matches the JSON file name */
  id: string;
  /** URL-friendly slug used for navigation */
  slug: string;
  /** Localized chapter title */
  title: string;
  /** Human-readable date range shown on the card badge */
  period: string;
  /** One-sentence teaser shown on the list card */
  teaser: string;
  /** Hero image — Wikimedia Commons HTTPS URL or local media key */
  imageAsset: string;
  /** Controls card list order */
  sortOrder: number;
  /** Ordered body sections rendered on the detail page */
  sections: HistorySection[];
}
