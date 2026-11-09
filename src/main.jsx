import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import '@fontsource-variable/inter';
import '@fontsource-variable/unbounded';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';

import App from './App.jsx';
import { AppProviders } from './context/AppProviders.jsx';

// Hosted builds (claude.ai Artifacts) can't rewrite unknown paths to
// index.html, so they route through the URL hash instead (#/planets/mars).
const Router = import.meta.env.MODE === 'artifact' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProviders>
        <App />
      </AppProviders>
    </Router>
  </React.StrictMode>,
);

// Fade out the static boot screen once React has painted.
requestAnimationFrame(() => {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('is-done');
  setTimeout(() => boot.remove(), 600);
});
