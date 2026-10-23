import React, { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';

const Experience = React.lazy(() =>
  import('./pages/Experience').then((m) => ({ default: m.Experience })),
);
const Education = React.lazy(() =>
  import('./pages/Education').then((m) => ({ default: m.Education })),
);
const Blog = React.lazy(() =>
  import('./pages/Blog').then((m) => ({ default: m.Blog })),
);

const SiteFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <a className="skip-link" href="#main-content">
      Skip to content
    </a>
    <Navbar />
    <main id="main-content" style={{ flex: 1 }}>
      {children}
    </main>
    <Footer />
  </div>
);

export const HomeDocument: React.FC = () => (
  <SiteFrame>
    <Home />
  </SiteFrame>
);

const OtherPages: React.FC = () => (
  <SiteFrame>
    <Suspense
      fallback={
        <div
          className="flex-center"
          style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}
        >
          <div className="shimmer-spinner" />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontWeight: '500',
              fontSize: '0.95rem',
            }}
          >
            Loading page...
          </p>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  </SiteFrame>
);

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomeDocument />} />
    <Route element={<OtherPages />}>
      <Route path="/experience" element={<Experience />} />
      <Route path="/education" element={<Education />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<Blog />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
