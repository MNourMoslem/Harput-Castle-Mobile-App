/**
 * UserPrefsContext — single source of truth for per-place user data.
 *
 * Wraps the whole app (see app/_layout.tsx).
 * All components that need favourite/visited/rating/note state read from here
 * so that PlaceCard, PlaceDetailSheet, and HomeScreen stay in sync automatically.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  loadPlaceUserData,
  savePlaceUserData,
  type PlaceUserData,
} from '@/services/userPrefs';
import { getTotalPlaces } from '@/services/places';

// ── Types ─────────────────────────────────────────────────────────────────────

type PrefsMap = Record<string, PlaceUserData>;

interface UserPrefsContextValue {
  prefs: PrefsMap;
  toggleFavorite: (placeId: string) => void;
  toggleVisited: (placeId: string) => void;
  setRating: (placeId: string, rating: number) => void;
  saveNote: (placeId: string, note: string) => void;
  getVisitedCount: () => number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLACE_IDS = Array.from(
  { length: getTotalPlaces() },
  (_, i) => `place${i + 1}`,
);

const DEFAULT_DATA: PlaceUserData = {
  isFavorite: false,
  visited: false,
  rating: 0,
  note: '',
};

// ── Context ───────────────────────────────────────────────────────────────────

const UserPrefsContext = createContext<UserPrefsContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function UserPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<PrefsMap>(() =>
    Object.fromEntries(PLACE_IDS.map((id) => [id, { ...DEFAULT_DATA }])),
  );

  // Load all place prefs from AsyncStorage on mount
  useEffect(() => {
    Promise.all(
      PLACE_IDS.map((id) =>
        loadPlaceUserData(id).then((data) => [id, data] as const),
      ),
    ).then((entries) => setPrefs(Object.fromEntries(entries)));
  }, []);

  // Generic patch helper — updates state + persists
  const patch = useCallback(
    (placeId: string, update: Partial<PlaceUserData>) => {
      setPrefs((prev) => {
        const current = prev[placeId] ?? { ...DEFAULT_DATA };
        savePlaceUserData(placeId, update); // fire-and-forget
        return { ...prev, [placeId]: { ...current, ...update } };
      });
    },
    [],
  );

  const toggleFavorite = useCallback(
    (placeId: string) => {
      setPrefs((prev) => {
        const isFavorite = !(prev[placeId] ?? DEFAULT_DATA).isFavorite;
        savePlaceUserData(placeId, { isFavorite });
        return {
          ...prev,
          [placeId]: { ...(prev[placeId] ?? DEFAULT_DATA), isFavorite },
        };
      });
    },
    [],
  );

  const toggleVisited = useCallback(
    (placeId: string) => {
      setPrefs((prev) => {
        const visited = !(prev[placeId] ?? DEFAULT_DATA).visited;
        savePlaceUserData(placeId, { visited });
        return {
          ...prev,
          [placeId]: { ...(prev[placeId] ?? DEFAULT_DATA), visited },
        };
      });
    },
    [],
  );

  const setRating = useCallback(
    (placeId: string, rating: number) => patch(placeId, { rating }),
    [patch],
  );

  const saveNote = useCallback(
    (placeId: string, note: string) => patch(placeId, { note }),
    [patch],
  );

  const getVisitedCount = useCallback(
    () => Object.values(prefs).filter((p) => p.visited).length,
    [prefs],
  );

  return (
    <UserPrefsContext.Provider
      value={{ prefs, toggleFavorite, toggleVisited, setRating, saveNote, getVisitedCount }}
    >
      {children}
    </UserPrefsContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Full context access — use when you need mutations. */
export function useUserPrefs(): UserPrefsContextValue {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefs must be inside <UserPrefsProvider>');
  return ctx;
}

/** Convenience: read-only prefs for a single place. */
export function usePlacePrefs(placeId: string): PlaceUserData {
  const { prefs } = useUserPrefs();
  return prefs[placeId] ?? { ...DEFAULT_DATA };
}
