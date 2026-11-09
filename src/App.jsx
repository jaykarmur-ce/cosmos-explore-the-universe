import { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { pages } from './routes.js';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import CosmicBackdrop from './components/CosmicBackdrop.jsx';
import RouteLoader from './components/RouteLoader.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PageTransition from './components/PageTransition.jsx';

function Page({ component: Component, immersive = false }) {
  return (
    <PageTransition immersive={immersive}>
      <Suspense fallback={<RouteLoader />}>
        <Component />
      </Suspense>
    </PageTransition>
  );
}

export default function App() {
  const location = useLocation();
  const section = location.pathname.split('/')[1] || 'home';
  const immersive = section === 'explore';
  // Planet pages share one key so switching planets (prev/next) keeps the
  // page and its 3D canvas mounted; every other path transitions normally.
  const routeKey = section === 'planets' ? 'planets' : location.pathname;

  return (
    <>
      {/* Focuses the main region directly so it never changes the URL hash
          (which would be read as a route when hash routing is used). */}
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      {!immersive && <CosmicBackdrop />}
      <Nav immersive={immersive} />
      <main id="main" tabIndex={-1} className="app-main">
        <ErrorBoundary resetKey={location.pathname}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={routeKey}>
              <Route path="/" element={<Page component={pages.home} />} />
              <Route path="/explore" element={<Page component={pages.explore} immersive />} />
              <Route path="/planets/:id" element={<Page component={pages.planet} />} />
              <Route path="/discoveries" element={<Page component={pages.discoveries} />} />
              <Route path="/discoveries/:id" element={<Page component={pages.discovery} />} />
              <Route path="/compare" element={<Page component={pages.compare} />} />
              <Route path="/mission-control" element={<Page component={pages.missionControl} />} />
              <Route path="/quiz" element={<Page component={pages.quiz} />} />
              <Route path="/favorites" element={<Page component={pages.favorites} />} />
              <Route path="*" element={<Page component={pages.notFound} />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {!immersive && <Footer />}
    </>
  );
}
