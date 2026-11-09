# Optional planet textures

COSMOS ships **without** image textures. Every surface (the Sun, all eight
planets, Earth's clouds and the Moon) is generated procedurally at runtime in a
Web Worker, so nothing in the app depends on files that might be missing.

You can swap in real texture maps at any time:

1. Put equirectangular images (2:1 aspect ratio, e.g. 2048×1024) in this
   folder — `public/textures/`.
2. Register them in `src/data/textureManifest.js`:

   ```js
   export const TEXTURE_OVERRIDES = {
     earth: { color: '/textures/earth_daymap.jpg', bump: '/textures/earth_bump.jpg' },
     'earth-clouds': { color: '/textures/earth_clouds.png' }, // PNG with transparency
     mars: { color: '/textures/mars.jpg' },
     saturn: { color: '/textures/saturn.jpg' },
   };
   ```

3. Restart the dev server (or reload the page).

Supported ids: `sun`, `mercury`, `venus`, `earth`, `earth-clouds`, `moon`,
`mars`, `jupiter`, `saturn`, `uranus`, `neptune`.

If an image fails to load, COSMOS logs a warning and falls back to the
procedural surface automatically. The same images are also used for the 2D
planet thumbnails.

## Licensing

Only use images you are allowed to redistribute. Good sources:

- **NASA / JPL / USGS imagery** — generally public domain (check each item's
  credit line).
- **Solar System Scope textures** — CC BY 4.0 (attribution required).

Saturn's rings are drawn from a procedural radial profile
(`src/lib/textures/canvasTextures.js`) and are not affected by these overrides.
