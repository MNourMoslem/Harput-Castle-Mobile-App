import type { PlaceCategory } from '@/types/place';

const CATEGORY_KEY_BY_TYPE: Record<PlaceCategory, string> = {
  tower: 'categoryTower',
  gate: 'categoryGate',
  mosque: 'categoryMosque',
  church: 'categoryChurch',
  cistern: 'categoryCistern',
  viewpoint: 'categoryViewpoint',
  ruins: 'categoryRuins',
  palace: 'categoryPalace',
  cemetery: 'categoryCemetery',
  archaeological: 'categoryArchaeological',
};

export function getPlaceCategoryLabel(
  category: PlaceCategory,
  t: (namespace: 'place', key: string) => string,
): string {
  return t('place', CATEGORY_KEY_BY_TYPE[category]);
}
