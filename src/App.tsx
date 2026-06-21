import React, { Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Lazy load page components for automatic bundle code-splitting
const Home = React.lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Experience = React.lazy(() => import("./pages/Experience").then(m => ({ default: m.Experience })));
const Projects = React.lazy(() => import("./pages/Projects").then(m => ({ default: m.Projects })));
const Education = React.lazy(() => import("./pages/Education").then(m => ({ default: m.Education })));
const Blog = React.lazy(() => import("./pages/Blog").then(m => ({ default: m.Blog })));

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Suspense fallback={
            <div className="flex-center" style={{ minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
              <div className="shimmer-spinner" />
              <p style={{ color: "var(--text-secondary)", fontWeight: "500", fontSize: "0.95rem" }}>Loading page...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/education" element={<Education />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
