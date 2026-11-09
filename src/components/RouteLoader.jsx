/** Fallback shown while a page's code chunk downloads. */
export default function RouteLoader({ label = 'Loading module' }) {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="orbit-spinner" aria-hidden="true" />
      <span className="label">{label}…</span>
    </div>
  );
}
