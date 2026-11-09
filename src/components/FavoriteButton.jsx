import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext.jsx';

/** Toggle an item in the personal collection. */
export default function FavoriteButton({ type, id, name, variant = 'button', size = 'md', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(type, id);
  const label = active ? `Remove ${name} from favorites` : `Add ${name} to favorites`;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`icon-btn fav-btn ${size === 'sm' ? 'icon-btn--sm' : ''} ${active ? 'is-active' : ''} ${className}`}
        aria-pressed={active}
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(type, id);
        }}
      >
        <Heart aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn fav-btn ${size === 'sm' ? 'btn--sm' : ''} ${active ? 'is-active' : ''} ${className}`}
      aria-pressed={active}
      onClick={() => toggleFavorite(type, id)}
    >
      <Heart aria-hidden="true" />
      <span>{active ? 'Saved to favorites' : 'Add to favorites'}</span>
      <span className="visually-hidden">: {name}</span>
    </button>
  );
}
