import { memo, useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView.js';
import { renderIllustration } from '../lib/illustrations/drawIllustration.js';

/**
 * Procedural illustration of a deep-space object. Rendering is deferred
 * until the element scrolls near the viewport, then cached for reuse.
 */
function CosmicIllustration({ art, width = 640, height = 400, className = '', label, showBadge = true }) {
  const [wrapRef, inView] = useInView('300px');
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!inView || !canvasRef.current) return undefined;
    let cancelled = false;
    // Yield a frame so scrolling stays smooth while a batch of cards renders.
    const id = requestAnimationFrame(() => {
      if (cancelled || !canvasRef.current) return;
      const source = renderIllustration(art, width, height);
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(source, 0, 0);
      setReady(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [inView, art, width, height]);

  return (
    <div ref={wrapRef} className={`cosmic-illustration ${ready ? 'is-ready' : ''} ${className}`}>
      <canvas ref={canvasRef} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />
      {showBadge && <span className="cosmic-illustration__badge label">Illustration</span>}
    </div>
  );
}

export default memo(CosmicIllustration);
