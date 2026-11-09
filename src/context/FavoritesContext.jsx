import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorage.js';
import { getBody } from '../data/planets.js';
import { getDiscovery } from '../data/discoveries.js';

const STORAGE_KEY = 'cosmos:favorites:v1';
const FavoritesContext = createContext(null);

const RESOLVERS = {
  planet: getBody,
  discovery: getDiscovery,
};

/** Keep only well-formed, known, unique entries. */
function sanitizeFavorites(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const clean = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const { type, id } = item;
    const resolve = RESOLVERS[type];
    if (!resolve || typeof id !== 'string' || !resolve(id)) continue;
    const key = `${type}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push({ type, id, addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now() });
  }
  return clean;
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorageState(STORAGE_KEY, [], sanitizeFavorites);

  const isFavorite = useCallback(
    (type, id) => favorites.some((f) => f.type === type && f.id === id),
    [favorites],
  );

  const addFavorite = useCallback(
    (type, id) =>
      setFavorites((prev) =>
        prev.some((f) => f.type === type && f.id === id)
          ? prev
          : sanitizeFavorites([...prev, { type, id, addedAt: Date.now() }]),
      ),
    [setFavorites],
  );

  const removeFavorite = useCallback(
    (type, id) => setFavorites((prev) => prev.filter((f) => !(f.type === type && f.id === id))),
    [setFavorites],
  );

  const toggleFavorite = useCallback(
    (type, id) => {
      const exists = favorites.some((f) => f.type === type && f.id === id);
      if (exists) removeFavorite(type, id);
      else addFavorite(type, id);
      return !exists;
    },
    [favorites, addFavorite, removeFavorite],
  );

  const restoreFavorite = useCallback(
    (entry) => setFavorites((prev) => sanitizeFavorites([...prev, entry])),
    [setFavorites],
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const value = useMemo(
    () => ({
      favorites,
      count: favorites.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      restoreFavorite,
      clearFavorites,
    }),
    [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, restoreFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
