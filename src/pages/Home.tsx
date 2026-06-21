import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Database, Server, Cpu } from "lucide-react";
import { personalInfo } from "../data/resumeData";

export const Home: React.FC = () => {
  return (
    <div style={{ paddingTop: "70px" }}>
      {/* Hero Section */}
      <section className="section-padding flex-center" style={{ minHeight: "80vh", position: "relative", overflow: "hidden" }}>
        {/* Soft decorative background glows */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "var(--accent-glow)",
          filter: "blur(80px)",
          zIndex: -1
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "hsla(280, 90%, 60%, 0.1)",
          filter: "blur(100px)",
          zIndex: -1
        }} />

        <div className="container scroll-reveal" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <span style={{
            fontSize: "0.9rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--accent)",
            background: "var(--accent-glow)",
            padding: "0.35rem 1rem",
            borderRadius: "50px",
            border: "1px solid var(--card-border)"
          }}>
            Welcome to my portfolio
          </span>

          <h1 style={{
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontFamily: "var(--font-heading)",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-0.03em",
            background: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            maxWidth: "800px"
          }}>
            Building Scalable & High-Performance Systems
          </h1>

          <h2 style={{
            fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
            fontWeight: "500",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: "1.4"
          }}>
            I'm <strong style={{ color: "var(--text-primary)" }}>{personalInfo.name} {personalInfo.lastName}</strong>, {personalInfo.title}.
          </h2>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "var(--text-secondary)",
            maxWidth: "650px",
            lineHeight: "1.7",
            marginTop: "0.5rem"
          }}>
            {personalInfo.summary}
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.5rem" }}>
            <Link to="/projects" className="btn btn-primary">
              View My Work <ArrowRight size={18} />
            </Link>
            <Link to="/experience" className="btn btn-secondary">
              My Experience
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Highlight / Key Pillars */}
      <section style={{ background: "var(--bg-secondary)", paddingBlock: "5rem", transition: "background-color var(--transition-smooth)" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem"
          }}>
            <div className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", textAlign: "center" }}>
              <div style={{ color: "var(--accent)", padding: "0.75rem", background: "var(--accent-glow)", borderRadius: "12px" }}>
                <Server size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Distributed Architecture</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Designing Kafka event streams processing 1M+ daily events.</p>
            </div>

            <div className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", textAlign: "center" }}>
              <div style={{ color: "var(--accent)", padding: "0.75rem", background: "var(--accent-glow)", borderRadius: "12px" }}>
                <Cpu size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Scale & Latency</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Managing API loads of 180K requests/day with sub-120ms p95 latency.</p>
            </div>

            <div className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", textAlign: "center" }}>
              <div style={{ color: "var(--accent)", padding: "0.75rem", background: "var(--accent-glow)", borderRadius: "12px" }}>
                <Database size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Data Ingestion</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Ingesting 100K+ articles daily on automated cloud pipelines.</p>
            </div>

            <div className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", textAlign: "center" }}>
              <div style={{ color: "var(--accent)", padding: "0.75rem", background: "var(--accent-glow)", borderRadius: "12px" }}>
                <Code size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Automation & Tooling</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Writing Python automation scripts that eliminate 15+ hours/week of manual tasks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
