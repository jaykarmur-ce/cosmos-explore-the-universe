/** Misc helpers: shuffling, searching and WebGL detection. */

export function shuffle(list, rand = Math.random) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeText(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9*+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every whitespace-separated term in `query` appears in `haystack`. */
export function matchesQuery(query, ...fields) {
  const q = normalizeText(query);
  if (!q) return true;
  const hay = normalizeText(fields.flat().join(' '));
  return q.split(' ').every((term) => hay.includes(term));
}

let webglSupport;
export function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    webglSupport = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}
