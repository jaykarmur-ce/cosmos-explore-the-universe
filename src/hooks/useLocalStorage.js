import { useCallback, useEffect, useRef, useState } from 'react';

/** Safe JSON read — returns `fallback` on missing, blocked or corrupt storage. */
export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Safe JSON write. Skips the write when nothing changed (avoids cross-tab ping-pong). */
export function writeStorage(key, value) {
  try {
    const json = JSON.stringify(value);
    if (window.localStorage.getItem(key) !== json) window.localStorage.setItem(key, json);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

/**
 * useState that persists to localStorage and stays in sync across tabs.
 * `sanitize` receives whatever was stored and must return a valid state,
 * which protects the app against stale or hand-edited data.
 */
export function useLocalStorageState(key, initialValue, sanitize) {
  const sanitizeRef = useRef(sanitize ?? ((v) => v));
  sanitizeRef.current = sanitize ?? ((v) => v);
  const initialRef = useRef(initialValue);

  const [state, setState] = useState(() => sanitizeRef.current(readStorage(key, initialValue)));
  // JSON of the last value received from another tab. Writing it back would
  // race with that tab's own writes, so it is skipped.
  const receivedRef = useRef(null);

  useEffect(() => {
    if (receivedRef.current !== null && JSON.stringify(state) === receivedRef.current) return;
    receivedRef.current = null;
    writeStorage(key, state);
  }, [key, state]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key && event.key !== null) return;
      const next = sanitizeRef.current(readStorage(key, initialRef.current));
      receivedRef.current = JSON.stringify(next);
      setState(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const reset = useCallback(() => setState(sanitizeRef.current(initialRef.current)), []);

  return [state, setState, reset];
}
