import { useEffect } from 'react';

const BASE = 'COSMOS — Explore the Universe';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · COSMOS` : BASE;
  }, [title]);
}
