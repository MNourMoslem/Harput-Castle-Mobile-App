import schema from '@/data/content/schema/place-detail.json';
import type { PlaceDetailSchemaMap, PlaceId } from '@/types/placeDetail';

export type { PlaceId };

export const PLACE_DETAIL_SCHEMA = schema as PlaceDetailSchemaMap;
