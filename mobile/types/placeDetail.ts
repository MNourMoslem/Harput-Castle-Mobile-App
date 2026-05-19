import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type PlaceId = string;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface StatField {
  icon: IoniconName;
  dataKey: string;
  labelKey: string;
  suffix?: string;
}

export interface TextField {
  dataKey: string;
  sectionKey: string;
}

export interface ListField {
  dataKey: string;
  sectionKey: string;
  icon: IoniconName;
}

export interface PlaceDetailSchema {
  statsSectionKey?: string;
  stats: StatField[];
  textSections: TextField[];
  listSections?: ListField[];
}

export type PlaceDetailSchemaMap = Record<string, PlaceDetailSchema>;

export type PlaceDetailRawData = Record<string, unknown>;
