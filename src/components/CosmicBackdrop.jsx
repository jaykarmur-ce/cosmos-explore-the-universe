import { useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { mulberry32 } from '../lib/noise.js';

/**
 * Fixed, lightweight 2D starfield behind non-immersive pages.
 * Twinkles slowly and shifts with the pointer (parallax); renders a single
 * static frame in reduced-effects mode and pauses while the tab is hidden.
 */
export default function CosmicBackdrop() {
  const canvasRef = useRef(null);
  const { reducedEffects } = usePreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(20261010);
    const count = reducedEffects ? 140 : 260;
    const stars = Array.from({ length: count }, () => ({
      x: rand(),
      y: rand(),
      r: rand() ** 3 * 1.4 + 0.25,
      depth: rand() * 0.8 + 0.2,
      phase: rand() * Math.PI * 2,
      speed: 0.4 + rand() * 1.2,
      tint: rand(),
    }));

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      for (const s of stars) {
        const twinkle = reducedEffects ? 1 : 0.65 + 0.35 * Math.sin(t * 0.001 * s.speed + s.phase);
        const px = s.x * width + pointer.x * 18 * s.depth;
        const py = s.y * height + pointer.y * 18 * s.depth;
        const alpha = (0.25 + s.depth * 0.6) * twinkle;
        ctx.fillStyle =
          s.tint > 0.85 ? `rgba(154,131,255,${alpha})` : s.tint > 0.7 ? `rgba(114,207,255,${alpha})` : `rgba(244,246,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onPointer = (e) => {
      pointer.tx = (e.clientX / width - 0.5) * 2;
      pointer.ty = (e.clientY / height - 0.5) * 2;
    };

    const onVisibility = () => {
      if (reducedEffects) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (reducedEffects) {
      draw(0);
      const redraw = () => draw(0);
      window.addEventListener('resize', redraw);
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('resize', redraw);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }
    window.addEventListener('pointermove', onPointer, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedEffects]);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__nebula" />
      <canvas ref={canvasRef} className="backdrop__stars" />
    </div>
  );
}
