/** COSMOS wordmark with an orbit glyph. */
export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <radialGradient id="logo-core" cx="38%" cy="35%" r="70%">
            <stop offset="0" stopColor="#F4F6FF" />
            <stop offset="0.5" stopColor="#72CFFF" />
            <stop offset="1" stopColor="#3B2F8F" />
          </radialGradient>
        </defs>
        <ellipse cx="16" cy="16" rx="14" ry="5.2" fill="none" stroke="#9A83FF" strokeWidth="1.2" transform="rotate(-24 16 16)" />
        <circle cx="16" cy="16" r="6.4" fill="url(#logo-core)" />
        <circle cx="27.6" cy="10.6" r="1.6" fill="#F4F6FF" />
      </svg>
      {!compact && <span className="logo__word">Cosmos</span>}
    </span>
  );
}
