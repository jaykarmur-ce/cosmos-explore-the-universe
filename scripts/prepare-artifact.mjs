/**
 * Post-processes `dist-artifact/index.html` for hosting as a claude.ai
 * Artifact. The host wraps the page in its own <!doctype>/<html>/<head>/<body>
 * skeleton, so this script strips those tags, drops head-only elements the
 * host provides (charset/viewport/theme metas, favicon) and keeps the title,
 * styles, boot screen, root element and module scripts.
 *
 * Usage: node scripts/prepare-artifact.mjs   (run after `vite build --mode artifact`)
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist-artifact');
const file = join(outDir, 'index.html');
let html = readFileSync(file, 'utf8');

const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>COSMOS</title>';

html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body>/gi, '')
  .replace(/<meta[^>]*>\s*/gi, '')
  .replace(/<link rel="icon"[^>]*>\s*/gi, '')
  .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

writeFileSync(file, `${title}\n${html}\n`);

// Files the page never requests.
for (const extra of ['favicon.svg', '_redirects', 'textures']) {
  const p = join(outDir, extra);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

const assets = readdirSync(join(outDir, 'assets'));
console.log(`Artifact page ready: dist-artifact/index.html + ${assets.length} files in dist-artifact/assets/`);
