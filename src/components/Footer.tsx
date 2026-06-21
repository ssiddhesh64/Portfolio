import React from "react";
import { Mail, Phone } from "lucide-react";
import { personalInfo } from "../data/resumeData";

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: "1px solid var(--card-border)",
      background: "var(--bg-secondary)",
      paddingBlock: "3rem",
      marginTop: "auto",
      transition: "background-color var(--transition-smooth), border-color var(--transition-smooth)"
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "0.25rem" }}>
            {personalInfo.name} {personalInfo.lastName}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {personalInfo.title}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href={`mailto:${personalInfo.email}`} aria-label="Email" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <Mail size={20} />
          </a>
          <a href={`tel:${personalInfo.mobile}`} aria-label="Phone" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <Phone size={20} />
          </a>
          <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
          <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect width="4" height="12" x="2" y="9"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", width: "100%", textAlign: "center", marginTop: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
          © {new Date().getFullYear()} {personalInfo.name} {personalInfo.lastName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
