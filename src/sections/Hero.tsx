import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine } from 'lucide-react';
import { personalInfo, roles } from '../data/resumeData';
import { blogPosts } from '../data/blogData';
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons';

const current = roles.find((r) => !r.end);
const previous = roles.find((r) => r.end && r.kind === 'full-time');
const latestPost = blogPosts[0];

export const Hero: React.FC = () => (
  <section className="hero wrap" aria-labelledby="hero-name">
    <div className="hero__lead">
      <h1 id="hero-name" className="hero__name">
        <span>{personalInfo.name}</span> <span>{personalInfo.lastName}</span>
      </h1>
      <p className="hero__focus">{personalInfo.focus}</p>
      <p className="hero__intro">{personalInfo.intro}</p>
      <div className="hero__actions">
        <a
          href={personalInfo.resumeUrl}
          download={personalInfo.resumeFileName}
          className="button button--primary"
        >
          <ArrowDownToLine size={18} aria-hidden />
          Download resume
          <span className="button__meta">{personalInfo.resumeMeta}</span>
        </a>
        <ul className="link-row" aria-label="Contact and profiles">
          <li>
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          </li>
          <li>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon size={16} />
              GitHub
            </a>
          </li>
          <li>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon size={16} />
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </div>

    <dl className="hero__facts" aria-label="At a glance">
      {current && (
        <div>
          <dt>Now</dt>
          <dd>
            {current.title}, {current.org}{' '}
            <span className="hero__aside">({current.kind})</span>
          </dd>
        </div>
      )}
      {previous && (
        <div>
          <dt>Before</dt>
          <dd>
            {previous.org},{' '}
            <span className="num">
              {previous.start.slice(0, 4)}–{previous.end?.slice(0, 4)}
            </span>
          </dd>
        </div>
      )}
      <div>
        <dt>Based in</dt>
        <dd>{personalInfo.location}</dd>
      </div>
      <div>
        <dt>Open to</dt>
        <dd>{personalInfo.availability}</dd>
      </div>
      {latestPost && (
        <div>
          <dt>Latest article</dt>
          <dd>
            <Link to={`/blog/${latestPost.id}`}>{latestPost.title}</Link>
          </dd>
        </div>
      )}
    </dl>
  </section>
);
