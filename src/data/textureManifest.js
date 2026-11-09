/**
 * Optional image textures.
 *
 * By default COSMOS generates every planet surface procedurally, so the app
 * never depends on image files that might be missing. To use real texture
 * maps instead, place equirectangular images (2:1 aspect ratio) in
 * `public/textures/` and register them here, e.g.:
 *
 *   earth: { color: '/textures/earth_daymap.jpg', bump: '/textures/earth_bump.jpg' },
 *   'earth-clouds': { color: '/textures/earth_clouds.png' }, // PNG with alpha
 *   saturn: { color: '/textures/saturn.jpg' },
 *
 * Supported ids: sun, mercury, venus, earth, earth-clouds, moon, mars,
 * jupiter, saturn, uranus, neptune.
 *
 * If an image fails to load, the procedural surface is used automatically and
 * a warning is logged to the console. See public/textures/README.md for
 * licensing notes and recommended sources.
 */
export const TEXTURE_OVERRIDES = {};
