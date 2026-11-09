import { lazy } from 'react';

/**
 * Lazily loaded pages. Each entry exposes `preload()` so navigation links can
 * warm up a page's code on hover/focus before the user clicks.
 */
function lazyPage(loader) {
  const Component = lazy(loader);
  Component.preload = loader;
  return Component;
}

export const pages = {
  home: lazyPage(() => import('./pages/Home.jsx')),
  explore: lazyPage(() => import('./pages/SolarSystem.jsx')),
  planet: lazyPage(() => import('./pages/PlanetDetail.jsx')),
  discoveries: lazyPage(() => import('./pages/Discoveries.jsx')),
  discovery: lazyPage(() => import('./pages/DiscoveryDetail.jsx')),
  compare: lazyPage(() => import('./pages/Compare.jsx')),
  missionControl: lazyPage(() => import('./pages/MissionControl.jsx')),
  quiz: lazyPage(() => import('./pages/Quiz.jsx')),
  favorites: lazyPage(() => import('./pages/Favorites.jsx')),
  notFound: lazyPage(() => import('./pages/NotFound.jsx')),
};

const PRELOAD_BY_PATH = {
  '/': pages.home,
  '/explore': pages.explore,
  '/planets': pages.planet,
  '/discoveries': pages.discoveries,
  '/compare': pages.compare,
  '/mission-control': pages.missionControl,
  '/quiz': pages.quiz,
  '/favorites': pages.favorites,
};

export function preloadPath(path) {
  const base = `/${(path.split('?')[0].split('#')[0].split('/')[1] ?? '')}`;
  PRELOAD_BY_PATH[base]?.preload?.().catch(() => {});
}

export const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Solar System' },
  { to: '/discoveries', label: 'Discoveries' },
  { to: '/compare', label: 'Compare' },
  { to: '/mission-control', label: 'Mission Control' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/favorites', label: 'Favorites', favorites: true },
];
