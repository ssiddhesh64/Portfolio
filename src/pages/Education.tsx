import React from "react";
import { GraduationCap, Calendar, Award } from "lucide-react";
import { education, skills } from "../data/resumeData";

export const Education: React.FC = () => {
  return (
    <div style={{ paddingTop: "70px", paddingBottom: "5rem" }}>
      <header className="page-header container">
        <h1>Education & Skills</h1>
        <p>My academic foundation in computer science, honors degrees, and specialized technical skill sets.</p>
      </header>

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
        
        {/* Education Section */}
        <section style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "var(--font-heading)" }}>
            <GraduationCap style={{ color: "var(--accent)" }} /> Education
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {education.map((edu, index) => (
              <div key={index} className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{edu.school}</h3>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={14} />
                    {edu.duration}
                  </span>
                </div>
                <h4 style={{ fontSize: "1.05rem", color: "var(--accent)", fontWeight: "600" }}>{edu.degree}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: "500", marginTop: "0.5rem" }}>
                  <Award size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                  {edu.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Strengths Section */}
        <section style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>Technical Skills Summary</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem"
          }}>
            {skills.map((category, index) => (
              <div key={index} className="glass-card scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", borderBottom: "2px solid var(--accent-glow)", paddingBottom: "0.5rem" }}>
                  {category.category}
                </h3>
                <div className="badge-container">
                  {category.items.map((skill, sIndex) => (
                    <span key={sIndex} className="badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
