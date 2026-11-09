import { MotionConfig } from 'framer-motion';
import { FavoritesProvider } from './FavoritesContext.jsx';
import { PreferencesProvider, usePreferences } from './PreferencesContext.jsx';
import { ProgressProvider } from './ProgressContext.jsx';

function MotionPreferences({ children }) {
  const { reducedEffects } = usePreferences();
  return <MotionConfig reducedMotion={reducedEffects ? 'always' : 'never'}>{children}</MotionConfig>;
}

export function AppProviders({ children }) {
  return (
    <PreferencesProvider>
      <MotionPreferences>
        <FavoritesProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </FavoritesProvider>
      </MotionPreferences>
    </PreferencesProvider>
  );
}
