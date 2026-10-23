import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './theme.css';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root')!;
const application = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, application);
} else {
  createRoot(rootElement).render(application);
}

const telemetryRoot = document.createElement('div');
document.body.append(telemetryRoot);
createRoot(telemetryRoot).render(
  <StrictMode>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
