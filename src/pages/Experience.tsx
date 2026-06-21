import React from "react";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { experiences } from "../data/resumeData";

export const Experience: React.FC = () => {
  return (
    <div style={{ paddingTop: "70px", paddingBottom: "5rem" }}>
      <header className="page-header container">
        <h1>Work Experience</h1>
        <p>A timeline of my professional journey, microservice development, and system optimization achievements.</p>
      </header>

      <div className="container">
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item scroll-reveal">
              <div className="timeline-marker" />
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div className="timeline-header">
                  <h3 className="timeline-org">{exp.org}</h3>
                  <span className="timeline-duration">
                    <Calendar size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    {exp.duration}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
                  <h4 className="timeline-role">
                    <Briefcase size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                    {exp.role}
                  </h4>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    <MapPin size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    {exp.location}
                  </span>
                </div>
                
                <ul className="timeline-details" style={{ marginTop: "1rem" }}>
                  {exp.details.map((detail, dIndex) => (
                    <li key={dIndex}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
