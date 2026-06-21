import React, { useState } from "react";
import { FolderGit2, Calendar, Cpu } from "lucide-react";
import { projects } from "../data/resumeData";

export const Projects: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Systems", "Web", "Machine Learning", "Information Retrieval"];

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter(project => 
        project.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase())
      );

  return (
    <div style={{ paddingTop: "70px", paddingBottom: "5rem" }}>
      <header className="page-header container">
        <h1>Projects Portfolio</h1>
        <p>A showcase of research, academic designs, systems programming, and database portals I built.</p>
      </header>

      <div className="container">
        {/* Filter Buttons */}
        <div className="filter-bar">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <div key={index} className="glass-card project-card scroll-reveal">
              <div className="project-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <h3 className="project-title">{project.name}</h3>
                  <div style={{ color: "var(--accent)", padding: "0.5rem", background: "var(--accent-glow)", borderRadius: "8px" }}>
                    <FolderGit2 size={20} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "500", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={14} />
                    {project.date}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Cpu size={14} />
                    {project.tech}
                  </span>
                </div>

                <ul style={{ listStyleType: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {project.details.map((detail, dIndex) => (
                    <li key={dIndex} style={{ color: "var(--text-secondary)", fontSize: "0.95rem", paddingLeft: "1.25rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>•</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="badge-container" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  {project.tags.map((tag, tIndex) => (
                    <span key={tIndex} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
