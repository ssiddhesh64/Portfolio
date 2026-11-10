import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import App from './App.tsx';

const root = document.getElementById('root')!;

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);

/**
 * Every route is prerendered at build time (scripts/prerender.ts), and
 * data-route records which one a file holds. Hydrate only when it is the
 * page being shown: 404.html is served for any unknown URL, and the dev
 * server serves an empty shell, so both render from scratch instead.
 */
const normalise = (path: string) => path.replace(/\/+$/, '') || '/';
const prerendered =
  root.dataset.route !== undefined &&
  normalise(root.dataset.route) === normalise(window.location.pathname);

if (prerendered) {
  hydrateRoot(root, app);
} else {
  root.textContent = '';
  createRoot(root).render(app);
}
