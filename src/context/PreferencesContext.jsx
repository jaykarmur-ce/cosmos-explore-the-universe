import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorage.js';
import { useSystemReducedMotion } from '../hooks/useMediaQuery.js';

const STORAGE_KEY = 'cosmos:preferences:v1';
const PreferencesContext = createContext(null);

export const TIME_SCALES = [
  { value: 2, label: '2 d/s' },
  { value: 10, label: '10 d/s' },
  { value: 50, label: '50 d/s' },
  { value: 200, label: '200 d/s' },
];

const DEFAULTS = {
  effects: 'auto', // 'auto' (follow the OS), 'full', 'reduced'
  showOrbits: true,
  showLabels: true,
  timeScale: 10,
  explorerHintDismissed: false,
};

function sanitizePreferences(value) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    effects: ['auto', 'full', 'reduced'].includes(v.effects) ? v.effects : DEFAULTS.effects,
    showOrbits: typeof v.showOrbits === 'boolean' ? v.showOrbits : DEFAULTS.showOrbits,
    showLabels: typeof v.showLabels === 'boolean' ? v.showLabels : DEFAULTS.showLabels,
    timeScale: TIME_SCALES.some((t) => t.value === v.timeScale) ? v.timeScale : DEFAULTS.timeScale,
    explorerHintDismissed: Boolean(v.explorerHintDismissed),
  };
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useLocalStorageState(STORAGE_KEY, DEFAULTS, sanitizePreferences);
  const systemReduced = useSystemReducedMotion();
  const reducedEffects = prefs.effects === 'reduced' || (prefs.effects === 'auto' && systemReduced);

  useEffect(() => {
    document.documentElement.dataset.effects = reducedEffects ? 'reduced' : 'full';
  }, [reducedEffects]);

  const setPreference = useCallback(
    (key, value) => setPrefs((prev) => sanitizePreferences({ ...prev, [key]: value })),
    [setPrefs],
  );

  const toggleEffects = useCallback(
    () => setPrefs((prev) => sanitizePreferences({ ...prev, effects: reducedEffects ? 'full' : 'reduced' })),
    [setPrefs, reducedEffects],
  );

  const value = useMemo(
    () => ({ prefs, setPreference, reducedEffects, systemReduced, toggleEffects }),
    [prefs, setPreference, reducedEffects, systemReduced, toggleEffects],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
