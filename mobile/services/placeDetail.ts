import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { PlaceDetailRawData } from '@/types/placeDetail';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface StatViewItem {
  icon: IoniconName;
  value: string;
  label: string;
}

export function formatDisplayValue(value: unknown, suffix?: string): string {
  const base =
    typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : typeof value === 'string'
      ? value
      : '';

  if (!base) return '';
  return `${base}${suffix ?? ''}`;
}

export function extractStringEntries(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return [raw];
  }

  return [];
}

export function buildStatItem(
  data: PlaceDetailRawData,
  field: { icon: IoniconName; dataKey: string; labelKey: string; suffix?: string },
  translate: (key: string) => string,
): StatViewItem | null {
  const value = formatDisplayValue(data[field.dataKey], field.suffix);
  if (!value) return null;

  return {
    icon: field.icon,
    value,
    label: translate(field.labelKey),
  };
}
