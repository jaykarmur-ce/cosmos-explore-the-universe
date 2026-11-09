/**
 * Surface-map service: generates (or loads) planet surface maps once and
 * caches them for the whole session.
 *
 * - Procedural maps are generated in a small pool of Web Workers so the UI
 *   stays responsive. If workers are unavailable, generation falls back to the
 *   main thread.
 * - Image overrides registered in data/textureManifest.js are loaded instead
 *   when present, with automatic fallback to the procedural map.
 *
 * Resolved value shape:
 *   { id, width, height, color: HTMLCanvasElement, bump: HTMLCanvasElement|null,
 *     pixels: Uint8ClampedArray (RGBA of `color`), source: 'procedural'|'image' }
 */
import { useEffect, useMemo, useState } from 'react';
import { generateSurface } from './surfaceGenerators.js';
import { TEXTURE_OVERRIDES } from '../../data/textureManifest.js';

const promises = new Map();
const resolved = new Map();

// ── worker pool ──────────────────────────────────────────────────────────

let workers = null;
let workersUnavailable = false;
const idleWorkers = [];
const queue = [];
let nextTaskId = 1;

function initPool() {
  if (workers || workersUnavailable) return;
  if (typeof Worker === 'undefined') {
    workersUnavailable = true;
    return;
  }
  try {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const size = Math.max(1, Math.min(4, cores - 1));
    workers = [];
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL('./surface.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = (event) => handleWorkerMessage(worker, event.data);
      worker.onerror = (event) => {
        event.preventDefault?.();
        handleWorkerFailure(worker);
      };
      workers.push(worker);
      idleWorkers.push(worker);
    }
  } catch {
    workers = null;
    workersUnavailable = true;
  }
}

function runOnMainThread(task) {
  // Yield first so loading UI can paint between surfaces.
  setTimeout(() => {
    try {
      task.resolve(generateSurface(task.id, task.width));
    } catch (error) {
      task.reject(error);
    }
  }, 16);
}

function pump() {
  if (!workers) {
    queue.splice(0).forEach(runOnMainThread);
    return;
  }
  queue.sort((a, b) => a.priority - b.priority);
  while (idleWorkers.length && queue.length) {
    const worker = idleWorkers.pop();
    const task = queue.shift();
    worker.currentTask = task;
    worker.postMessage({ taskId: task.taskId, id: task.id, width: task.width });
  }
}

function handleWorkerMessage(worker, data) {
  const task = worker.currentTask;
  worker.currentTask = null;
  idleWorkers.push(worker);
  if (task && task.taskId === data.taskId) {
    if (data.ok) task.resolve(data);
    else task.reject(new Error(data.error));
  }
  pump();
}

function handleWorkerFailure(worker) {
  const task = worker.currentTask;
  worker.currentTask = null;
  worker.terminate();
  workers = workers ? workers.filter((w) => w !== worker) : null;
  const idleIndex = idleWorkers.indexOf(worker);
  if (idleIndex >= 0) idleWorkers.splice(idleIndex, 1);
  if (task) runOnMainThread(task);
  if (!workers || workers.length === 0) {
    workers = null;
    workersUnavailable = true;
  }
  pump();
}

function generate(id, width, priority) {
  return new Promise((resolve, reject) => {
    initPool();
    queue.push({ taskId: nextTaskId++, id, width, priority, resolve, reject });
    pump();
  });
}

// ── conversion helpers ───────────────────────────────────────────────────

function canvasFromPixels(pixels, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
  return canvas;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load texture ${url}`));
    img.src = url;
  });
}

function canvasFromImage(img, width) {
  const height = Math.round(width / 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

async function loadOverride(id, width, override) {
  const colorImg = await loadImage(override.color);
  const bumpImg = override.bump ? await loadImage(override.bump).catch(() => null) : null;
  const color = canvasFromImage(colorImg, width);
  const pixels = color.getContext('2d').getImageData(0, 0, color.width, color.height).data;
  return {
    id,
    width: color.width,
    height: color.height,
    color,
    bump: bumpImg ? canvasFromImage(bumpImg, width) : null,
    pixels,
    source: 'image',
  };
}

async function buildSurface(id, width, priority) {
  const override = TEXTURE_OVERRIDES[id];
  if (override?.color) {
    try {
      return await loadOverride(id, width, override);
    } catch (error) {
      console.warn(`[COSMOS] ${error.message}. Falling back to the procedural "${id}" surface.`);
    }
  }
  const data = await generate(id, width, priority);
  return {
    id,
    width: data.width,
    height: data.height,
    color: canvasFromPixels(data.color, data.width, data.height),
    bump: data.bump ? canvasFromPixels(data.bump, data.width, data.height) : null,
    pixels: data.color,
    source: 'procedural',
  };
}

// ── public API ───────────────────────────────────────────────────────────

const keyOf = (id, width) => `${id}@${width}`;

export function peekSurface(id, width) {
  return resolved.get(keyOf(id, width)) ?? null;
}

/** Request a surface map. Lower priority numbers are generated first. */
export function requestSurface(id, width = 1024, priority = 5) {
  const key = keyOf(id, width);
  let promise = promises.get(key);
  if (!promise) {
    promise = buildSurface(id, width, priority).then((surface) => {
      resolved.set(key, surface);
      return surface;
    });
    promise.catch(() => promises.delete(key));
    promises.set(key, promise);
  }
  return promise;
}

/** React hook: a single surface map (null while loading). */
export function useSurface(id, width = 1024, priority = 5) {
  const [surface, setSurface] = useState(() => (id ? peekSurface(id, width) : null));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    const cached = peekSurface(id, width);
    if (cached) {
      setSurface(cached);
      return undefined;
    }
    setSurface(null);
    requestSurface(id, width, priority).then(
      (s) => active && setSurface(s),
      (e) => active && setError(e),
    );
    return () => {
      active = false;
    };
  }, [id, width, priority]);

  return { surface, error };
}

/**
 * React hook: several surface maps with real progress reporting.
 * `ids` should be a stable array (memoise it in the caller).
 */
export function useSurfaceSet(ids, width = 1024) {
  const initial = useMemo(() => {
    const map = {};
    ids.forEach((id) => {
      const s = peekSurface(id, width);
      if (s) map[id] = s;
    });
    return map;
  }, [ids, width]);
  const [surfaces, setSurfaces] = useState(initial);
  const [failed, setFailed] = useState([]);

  useEffect(() => {
    let active = true;
    setSurfaces(initial);
    setFailed([]);
    ids.forEach((id, index) => {
      if (initial[id]) return;
      requestSurface(id, width, index).then(
        (s) => active && setSurfaces((prev) => ({ ...prev, [id]: s })),
        () => active && setFailed((prev) => [...prev, id]),
      );
    });
    return () => {
      active = false;
    };
  }, [ids, width, initial]);

  const loaded = Object.keys(surfaces).length;
  const settled = loaded + failed.length;
  const pendingId = ids.find((id) => !surfaces[id] && !failed.includes(id)) ?? null;
  return {
    surfaces,
    failed,
    loaded,
    total: ids.length,
    done: settled >= ids.length,
    progress: ids.length ? settled / ids.length : 1,
    pendingId,
  };
}
