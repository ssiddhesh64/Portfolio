import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';

const BlogIndex = React.lazy(() =>
  import('./pages/BlogIndex').then((m) => ({ default: m.BlogIndex })),
);
const BlogPost = React.lazy(() =>
  import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })),
);
const BlogCategory = React.lazy(() =>
  import('./pages/BlogCategory').then((m) => ({ default: m.BlogCategory })),
);
const NotFound = React.lazy(() =>
  import('./pages/NotFound').then((m) => ({ default: m.NotFound })),
);

/** Scrolls to the URL's #fragment after navigation, or to the top if none. */
const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

/**
 * The router is supplied by the caller: BrowserRouter in main.tsx,
 * StaticRouter when prerendering in entry-server.tsx.
 */
const App: React.FC = () => (
  <>
    <ScrollManager />
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <div className="page">
      <Navbar />
      <main id="main" className="page__main">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  </>
);

export default App;
