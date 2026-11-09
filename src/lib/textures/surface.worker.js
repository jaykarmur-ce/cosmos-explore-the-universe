/* Web Worker: generates procedural surface maps off the main thread. */
import { generateSurface } from './surfaceGenerators.js';

self.onmessage = (event) => {
  const { taskId, id, width } = event.data;
  try {
    const result = generateSurface(id, width);
    const transfer = [result.color.buffer];
    if (result.bump) transfer.push(result.bump.buffer);
    self.postMessage({ taskId, ok: true, ...result }, transfer);
  } catch (error) {
    self.postMessage({ taskId, ok: false, error: String(error?.message ?? error) });
  }
};
