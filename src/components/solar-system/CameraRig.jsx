import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAYOUT, focusDistance, getBodyPosition } from './layout.js';

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const UP = new THREE.Vector3(0, 1, 0);

/** Overview camera position that frames the system for the current aspect ratio. */
export function overviewPosition(aspect, out = new THREE.Vector3()) {
  const fovHalfTan = Math.tan(THREE.MathUtils.degToRad(45 / 2));
  const dist = THREE.MathUtils.clamp(122 / (fovHalfTan * Math.max(aspect, 0.4)), 150, 360);
  const portrait = aspect < 0.9;
  const dir = portrait ? new THREE.Vector3(0, 1.5, 1) : new THREE.Vector3(0, 0.62, 1);
  return out.copy(dir.normalize().multiplyScalar(dist));
}

/**
 * Smoothly flies the camera to the selected body and then follows it along
 * its orbit while leaving OrbitControls free for the user. Runs between the
 * body position update (priority -2) and OrbitControls.update (priority -1).
 */
export default function CameraRig({ selectedId, focusToken, resetToken, clock, reduced, panelOpen }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const size = useThree((s) => s.size);
  const anim = useRef(null);
  const shift = useRef({ x: 0, y: 0 });
  const followPrev = useRef(new THREE.Vector3());
  const tmp = useRef({ p: new THREE.Vector3(), pos: new THREE.Vector3(), offset: new THREE.Vector3() }).current;

  // Let any user drag interrupt an in-flight transition.
  useEffect(() => {
    if (!controls) return undefined;
    const cancel = () => {
      if (anim.current) anim.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  // Focus transition whenever a body is (re)selected.
  useEffect(() => {
    if (!controls || !selectedId) return;
    const P = getBodyPosition(selectedId, clock.days, new THREE.Vector3());
    const dist = focusDistance(selectedId);
    let offset;
    if (selectedId === 'sun') {
      offset = new THREE.Vector3(0, 0.45, 1).normalize().multiplyScalar(dist);
    } else {
      // Three-quarter lit view: between the Sun and the planet, slightly
      // above the ecliptic, on the same side the camera already is.
      const toSun = P.clone().negate().normalize();
      const side = new THREE.Vector3().crossVectors(UP, toSun).normalize();
      const sign = Math.sign(camera.position.clone().sub(P).dot(side)) || 1;
      offset = toSun.multiplyScalar(0.62).add(UP.clone().multiplyScalar(0.32)).add(side.multiplyScalar(0.72 * sign)).normalize().multiplyScalar(dist);
    }
    controls.minDistance = Math.max(0.6, LAYOUT[selectedId].radius * 1.35);
    anim.current = {
      mode: 'focus',
      t: 0,
      duration: reduced ? 0.0001 : 1.7,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      offset,
    };
    followPrev.current.copy(P);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, focusToken, controls]);

  // Return to the overview.
  useEffect(() => {
    if (!controls || resetToken === 0) return;
    controls.minDistance = 2;
    anim.current = {
      mode: 'overview',
      t: 0,
      duration: reduced ? 0.0001 : 1.5,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: overviewPosition(size.width / size.height),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken, controls]);

  // Off-centre projection so the focused body sits in the space left free by
  // the info panel (right side on desktop, bottom sheet on mobile).
  useEffect(() => () => camera.clearViewOffset(), [camera]);

  useFrame((_, delta) => {
    const mobile = size.width <= 760;
    const tx = panelOpen && !mobile ? Math.min(400, size.width * 0.32) / 2 : 0;
    const ty = panelOpen && mobile ? size.height * 0.2 : 0;
    const s = shift.current;
    const k = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    s.x += (tx - s.x) * k;
    s.y += (ty - s.y) * k;
    if (Math.abs(s.x) < 0.5 && Math.abs(s.y) < 0.5 && tx === 0 && ty === 0) {
      if (camera.view?.enabled) camera.clearViewOffset();
    } else {
      camera.setViewOffset(size.width, size.height, s.x, s.y, size.width, size.height);
    }
  }, -1.6);

  useFrame((_, delta) => {
    if (!controls) return;
    const a = anim.current;

    if (a) {
      a.t = Math.min(1, a.t + Math.min(delta, 0.05) / a.duration);
      const e = easeInOutCubic(a.t);
      if (a.mode === 'focus' && selectedId) {
        const P = getBodyPosition(selectedId, clock.days, tmp.p);
        tmp.pos.copy(P).add(a.offset);
        camera.position.lerpVectors(a.fromPos, tmp.pos, e);
        controls.target.lerpVectors(a.fromTarget, P, e);
        followPrev.current.copy(P);
      } else if (a.mode === 'overview') {
        camera.position.lerpVectors(a.fromPos, a.toPos, e);
        controls.target.lerpVectors(a.fromTarget, tmp.p.set(0, 0, 0), e);
      }
      if (a.t >= 1) anim.current = null;
      return;
    }

    // Follow the selected body as it orbits, preserving the user's framing.
    if (selectedId && selectedId !== 'sun') {
      const P = getBodyPosition(selectedId, clock.days, tmp.p);
      tmp.offset.subVectors(P, followPrev.current);
      camera.position.add(tmp.offset);
      controls.target.add(tmp.offset);
      followPrev.current.copy(P);
    }
  }, -1.5);

  return null;
}
