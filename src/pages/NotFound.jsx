import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Orbit } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Lost in space');
  const { pathname } = useLocation();
  return (
    <div className="page container">
      <div className="empty" role="alert">
        <div className="empty__icon">
          <Compass aria-hidden="true" />
        </div>
        <p className="eyebrow">Error 404 · Off course</p>
        <h1 className="h1">Lost in space</h1>
        <p>
          There is nothing at <span className="mono">{pathname}</span>. The page may have moved, or the coordinates were
          mistyped.
        </p>
        <div className="empty__actions">
          <Link to="/" className="btn btn--primary">
            <Home aria-hidden="true" /> Return home
          </Link>
          <Link to="/explore" className="btn">
            <Orbit aria-hidden="true" /> Open the solar system
          </Link>
        </div>
      </div>
    </div>
  );
}
