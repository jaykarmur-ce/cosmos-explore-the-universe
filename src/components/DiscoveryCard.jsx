import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TiltCard from './TiltCard.jsx';
import CosmicIllustration from './CosmicIllustration.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import { getCategory } from '../data/discoveries.js';

/** Deep-space discovery card: tilts toward the cursor, with a parallax illustration. */
export default function DiscoveryCard({ item, compact = false }) {
  const location = useLocation();
  const category = getCategory(item.category);
  const distance = item.stats.find((s) => s.label === 'Distance');
  const from = location.pathname === '/discoveries' ? location.search : undefined;

  return (
    <TiltCard as="article" className={`discovery-card${compact ? ' discovery-card--compact' : ''}`} tilt={5}>
      <div className="discovery-card__media">
        <CosmicIllustration art={item.art} width={compact ? 480 : 640} height={compact ? 300 : 400} />
        <span className="tag tag--accent discovery-card__category">{category?.singular}</span>
        <FavoriteButton type="discovery" id={item.id} name={item.name} variant="icon" size="sm" className="discovery-card__fav" />
      </div>
      <div className="discovery-card__body">
        <p className="label">{item.designation}</p>
        <h3 className="discovery-card__title">
          <Link to={`/discoveries/${item.id}`} state={from !== undefined ? { from } : undefined} className="discovery-card__link">
            {item.name}
          </Link>
        </h3>
        {!compact && <p className="discovery-card__summary">{item.summary}</p>}
        <div className="discovery-card__foot">
          {distance && <span className="mono dim discovery-card__distance">{distance.value}</span>}
          <span className="link-arrow discovery-card__cta" aria-hidden="true">
            Discover more <ArrowRight />
          </span>
        </div>
      </div>
    </TiltCard>
  );
}
