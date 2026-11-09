import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Info } from 'lucide-react';

import CosmicIllustration from '../components/CosmicIllustration.jsx';
import DiscoveryCard from '../components/DiscoveryCard.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import NotFound from './NotFound.jsx';
import { getCategory, getDiscovery } from '../data/discoveries.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { LAST_DISCOVERY_SEARCH_KEY as LAST_SEARCH_KEY } from '../utils/storageKeys.js';
import './Discoveries.css';

function collectionLink(state) {
  if (typeof state?.from === 'string') return `/discoveries${state.from}`;
  try {
    return `/discoveries${sessionStorage.getItem(LAST_SEARCH_KEY) ?? ''}`;
  } catch {
    return '/discoveries';
  }
}

export default function DiscoveryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const item = getDiscovery(id);
  const { markDiscoveryViewed } = useProgress();
  useDocumentTitle(item ? item.name : 'Not found');

  useEffect(() => {
    if (item) markDiscoveryViewed(item.id);
  }, [item, markDiscoveryViewed]);

  if (!item) return <NotFound />;

  const category = getCategory(item.category);
  const backTo = collectionLink(location.state);
  const hasFilters = backTo.includes('?');
  const related = item.related.map(getDiscovery).filter(Boolean);

  return (
    <article className="page container discovery-detail">
      <Link to={backTo} className="link-arrow discovery-detail__back">
        <ArrowLeft aria-hidden="true" /> Back to collection{hasFilters ? ' (filters kept)' : ''}
      </Link>

      <div className="discovery-detail__banner">
        <CosmicIllustration art={item.art} width={1280} height={560} label={`Illustration representing ${item.name}`} />
      </div>

      <header className="discovery-detail__header">
        <div>
          <Link to={`/discoveries?cat=${item.category}`} className="tag tag--accent">
            {category?.label}
          </Link>
          <h1 className="h1 discovery-detail__title">{item.name}</h1>
          <p className="label">{item.designation}</p>
        </div>
        <FavoriteButton type="discovery" id={item.id} name={item.name} />
      </header>

      <div className="discovery-detail__grid">
        <div className="discovery-detail__prose">
          <p className="lede">{item.summary}</p>
          {item.description.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}

          <h2 className="h3 discovery-detail__facts-title">
            <Lightbulb aria-hidden="true" className="inline-icon" /> Key facts
          </h2>
          <ul role="list" className="discovery-facts">
            {item.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <aside className="panel panel--pad discovery-detail__aside" aria-label="Quick data">
          <p className="eyebrow">At a glance</p>
          <dl className="discovery-stats">
            {item.stats.map((s) => (
              <div key={s.label}>
                <dt className="label">{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="discovery-detail__note dim">
            <Info aria-hidden="true" className="inline-icon" />
            Distances and masses are rounded published estimates; many are refined as measurements improve. The image
            is a procedural illustration.
          </p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="discovery-related" aria-labelledby="related-title">
          <h2 id="related-title" className="h2">
            Related discoveries
          </h2>
          <ul role="list" className="discovery-grid discovery-grid--related">
            {related.map((r) => (
              <li key={r.id}>
                <DiscoveryCard item={r} compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
