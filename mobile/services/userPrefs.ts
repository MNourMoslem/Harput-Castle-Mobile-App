import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlaceUserData {
  /** Whether the user has saved this place as a favourite */
  isFavorite: boolean;
  /** Whether the user has physically visited this place */
  visited: boolean;
  /** User rating 0 (not rated) → 1–5 */
  rating: number;
  /** User's personal note / mini-review attached to the rating */
  note: string;
}

const DEFAULTS: PlaceUserData = {
  isFavorite: false,
  visited: false,
  rating: 0,
  note: '',
};

const key = (placeId: string) => `@harput-explorer:place:${placeId}`;

export async function loadPlaceUserData(
  placeId: string,
): Promise<PlaceUserData> {
  try {
    const raw = await AsyncStorage.getItem(key(placeId));
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePlaceUserData(
  placeId: string,
  patch: Partial<PlaceUserData>,
): Promise<void> {
  try {
    const current = await loadPlaceUserData(placeId);
    await AsyncStorage.setItem(
      key(placeId),
      JSON.stringify({ ...current, ...patch }),
    );
  } catch {
    // Non-critical — will persist to backend when available
  }
}
