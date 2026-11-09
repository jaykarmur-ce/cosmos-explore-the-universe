import { forwardRef, useCallback, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';

/**
 * Polymorphic card with mouse-driven interactivity:
 *  - tilts toward the cursor in 3D (`tilt` degrees, 0 to disable)
 *  - a soft spotlight and border glow follow the pointer
 *  - reports hover start/end through `onHoverChange`
 *
 * Effects only run for mouse/pen pointers and are disabled in reduced-effects
 * mode. Values are written as CSS variables, so pointer movement never
 * re-renders React.
 */
const TiltCard = forwardRef(function TiltCard(
  { as: Component = 'div', tilt = 7, className = '', onHoverChange, onPointerMove, onPointerEnter, onPointerLeave, children, ...rest },
  forwardedRef,
) {
  const localRef = useRef(null);
  const frame = useRef(0);
  const { reducedEffects } = usePreferences();

  const setRefs = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const handleMove = (e) => {
    onPointerMove?.(e);
    if (reducedEffects || e.pointerType === 'touch') return;
    const el = localRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      if (tilt) {
        el.style.setProperty('--rx', `${((0.5 - py) * tilt).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * tilt).toFixed(2)}deg`);
      }
    });
  };

  const handleEnter = (e) => {
    onPointerEnter?.(e);
    if (e.pointerType === 'touch') return;
    if (!reducedEffects) localRef.current?.setAttribute('data-hover', '');
    onHoverChange?.(true);
  };

  const handleLeave = (e) => {
    onPointerLeave?.(e);
    cancelAnimationFrame(frame.current);
    const el = localRef.current;
    if (el) {
      el.removeAttribute('data-hover');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
    onHoverChange?.(false);
  };

  return (
    <Component
      ref={setRefs}
      className={`tilt-card ${className}`}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default TiltCard;
