import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  Workflow,
} from 'lucide-react';
import {
  earlierProjects,
  projects,
  type Project,
  type ProjectLink,
} from '../data/projects';
import repoStats from '../data/repoStats.json';
import { SectionHead } from '../components/SectionHead';
import { GitHubIcon } from '../components/BrandIcons';
import { Mermaid } from '../components/blog/Mermaid';
import { Zoomable } from '../components/blog/Lightbox';
import { useCopy } from '../components/blog/useCopy';

type RepoStats = Record<
  string,
  { commits: number; pushedAt: string; fork: boolean }
>;
const stats = repoStats as RepoStats;

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
/** "2026-11-04" -> "Nov 2026" */
const monthYear = (iso: string) =>
  `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

/** "https://github.com/a/b" -> "a/b", for looking up its stats. */
const repoOf = (href: string) =>
  href.match(/github\.com\/([\w.-]+\/[\w.-]+)$/)?.[1];

const LINK_ICON: Record<ProjectLink['kind'], React.ReactNode> = {
  repo: <GitHubIcon size={16} />,
  demo: <Globe size={16} aria-hidden />,
  post: <FileText size={16} aria-hidden />,
};

/** What the second line of a proof link says: hard numbers where there are some. */
function linkMeta(link: ProjectLink): string {
  if (link.kind === 'repo') {
    const s = stats[repoOf(link.href) ?? ''];
    return s
      ? `${s.commits} commits · pushed ${monthYear(s.pushedAt)}`
      : 'GitHub';
  }
  if (link.kind === 'demo') return new URL(link.href).host;
  return link.href.startsWith('/') ? 'Blog post' : 'Write-up on GitHub';
}

const ProofLinks: React.FC<{ links: ProjectLink[] }> = ({ links }) => (
  <ul className="proof" aria-label="Links">
    {links.map((link) => {
      const body = (
        <>
          <span className="proof__icon">{LINK_ICON[link.kind]}</span>
          <span className="proof__text">
            <span className="proof__label">{link.label}</span>
            <span className="proof__meta num">{linkMeta(link)}</span>
          </span>
          <ArrowUpRight className="proof__arrow" size={16} aria-hidden />
        </>
      );
      return (
        <li key={link.href}>
          {link.href.startsWith('/') ? (
            <Link to={link.href} className="proof__link">
              {body}
            </Link>
          ) : (
            <a
              href={link.href}
              className="proof__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {body}
            </a>
          )}
        </li>
      );
    })}
  </ul>
);

const Facts: React.FC<{ facts: Project['facts'] }> = ({ facts }) => (
  <dl className="facts">
    {facts.map((f) => (
      <div key={f.label} className="facts__item">
        <dt className="facts__label">{f.label}</dt>
        <dd className="facts__value num">{f.value}</dd>
      </div>
    ))}
  </dl>
);

const Status: React.FC<{ status: Project['status'] }> = ({ status }) =>
  status?.length ? (
    <ul className="status" aria-label="Status">
      {status.map((s) => (
        <li key={s.label} className={`status__chip status__chip--${s.tone}`}>
          {s.label}
        </li>
      ))}
    </ul>
  ) : null;

const Stack: React.FC<{ stack: string[] }> = ({ stack }) => (
  <p className="project-stack">
    <span className="visually-hidden">Technologies: </span>
    {stack.map((t) => (
      <span key={t}>{t}</span>
    ))}
  </p>
);

const Next: React.FC<{ text?: string }> = ({ text }) =>
  text ? (
    <p className="project-next">
      <span className="project-next__label">What I’d change next</span>
      {text}
    </p>
  ) : null;

const RunCommand: React.FC<{ command: string }> = ({ command }) => {
  const { state, copy } = useCopy();
  return (
    <div className="run">
      <span className="run__label">Run it locally</span>
      <div className="run__line">
        <code className="run__code">
          <span className="run__prompt" aria-hidden>
            $
          </span>
          {command}
        </code>
        <button
          type="button"
          className="icon-button run__copy"
          onClick={() => copy(command)}
          aria-label={state === 'copied' ? 'Copied' : 'Copy command'}
        >
          {state === 'copied' ? (
            <Check size={14} aria-hidden />
          ) : (
            <Copy size={14} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
};

/** Screenshots in device frames, or the architecture diagram, behind tabs. */
const Viewer: React.FC<{ project: Project }> = ({ project }) => {
  const id = useId();
  const tabs = [
    project.shots?.length && {
      key: 'screens',
      label: 'Screens',
      icon: <ImageIcon size={15} aria-hidden />,
    },
    project.architecture && {
      key: 'architecture',
      label: 'Architecture',
      icon: <Workflow size={15} aria-hidden />,
    },
  ].filter(Boolean) as { key: string; label: string; icon: React.ReactNode }[];
  const [active, setActive] = useState(tabs[0]?.key);
  if (!tabs.length) return null;

  const desktop = project.shots?.find((s) => s.device === 'desktop');
  const demo = project.links.find((l) => l.kind === 'demo');

  return (
    <div className="viewer">
      <div
        className="viewer__tabs"
        role="tablist"
        aria-label={`${project.name}: views`}
      >
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`${id}-tab-${t.key}`}
            aria-controls={`${id}-panel`}
            aria-selected={active === t.key}
            tabIndex={active === t.key ? 0 : -1}
            className="viewer__tab"
            onClick={() => setActive(t.key)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const step = e.key === 'ArrowRight' ? 1 : -1;
              const next = tabs[(i + step + tabs.length) % tabs.length];
              setActive(next.key);
              document.getElementById(`${id}-tab-${next.key}`)?.focus();
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="viewer__panel"
      >
        {active === 'screens' && desktop && (
          <figure className="screens">
            <div className="browser">
              <div className="browser__bar" aria-hidden>
                <span className="browser__dots">
                  <i />
                  <i />
                  <i />
                </span>
                {demo && (
                  <span className="browser__url">
                    {new URL(demo.href).host}
                    {new URL(demo.href).pathname.replace(/\/$/, '')}
                  </span>
                )}
              </div>
              <Zoomable
                label={desktop.alt}
                full={
                  <img
                    className="lightbox__image"
                    src={desktop.src}
                    alt={desktop.alt}
                    width={desktop.width}
                    height={desktop.height}
                  />
                }
              >
                <img
                  src={desktop.src}
                  alt={desktop.alt}
                  width={desktop.width}
                  height={desktop.height}
                  loading="lazy"
                  decoding="async"
                />
              </Zoomable>
            </div>
            <figcaption className="figure__caption">
              Captured from the live site.
            </figcaption>
          </figure>
        )}
        {active === 'architecture' && project.architecture && (
          <Mermaid
            chart={project.architecture}
            caption={project.architectureCaption}
          />
        )}
      </div>
    </div>
  );
};

const Featured: React.FC<{ project: Project }> = ({ project: p }) => (
  <article id={p.id} className="case" aria-labelledby={`${p.id}-title`}>
    <div className="case__intro">
      <p className="case__eyebrow">
        <span>Featured</span>
        <span className="num">{p.period}</span>
      </p>
      <h3 id={`${p.id}-title`} className="case__title">
        {p.name}
      </h3>
      <p className="case__summary">{p.summary}</p>
      <Status status={p.status} />
      {p.role && <p className="case__role">{p.role}</p>}
      {p.problem && (
        <div className="case__problem">
          <h4 className="project-label">The problem</h4>
          <p>{p.problem}</p>
        </div>
      )}
      <Facts facts={p.facts} />
    </div>
    <div className="case__visual">
      <Viewer project={p} />
      <ProofLinks links={p.links} />
    </div>
    {p.decisions.length > 0 && (
      <div className="case__decisions">
        <h4 className="project-label">Decisions worth asking me about</h4>
        <ol className="decisions">
          {p.decisions.map((d, i) => (
            <li key={d.title} className="decisions__item">
              <span className="decisions__n num" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h5 className="decisions__title">{d.title}</h5>
              <p className="decisions__body">{d.body}</p>
            </li>
          ))}
        </ol>
      </div>
    )}
    <div className="case__foot">
      <Next text={p.next} />
      <Stack stack={p.stack} />
    </div>
  </article>
);

const Card: React.FC<{ project: Project }> = ({ project: p }) => (
  <article id={p.id} className="pcard" aria-labelledby={`${p.id}-title`}>
    <header className="pcard__head">
      <h3 id={`${p.id}-title`} className="pcard__title">
        {p.name}
      </h3>
      <p className="pcard__period num">{p.period}</p>
    </header>
    <p className="pcard__summary">{p.summary}</p>
    <Facts facts={p.facts} />
    {p.architecture && (
      <div className="pcard__diagram">
        <Mermaid chart={p.architecture} />
      </div>
    )}
    <dl className="pcard__decisions">
      {p.decisions.map((d) => (
        <div key={d.title}>
          <dt>{d.title}</dt>
          <dd>{d.body}</dd>
        </div>
      ))}
    </dl>
    <Next text={p.next} />
    {p.run && <RunCommand command={p.run} />}
    <div className="pcard__foot">
      <ProofLinks links={p.links} />
      <Stack stack={p.stack} />
    </div>
  </article>
);

export const Projects: React.FC = () => {
  const featured = projects.filter((p) => p.tier === 'featured');
  const selected = projects.filter((p) => p.tier === 'selected');
  return (
    <section
      className="section wrap"
      id="projects"
      aria-labelledby="projects-title"
    >
      <SectionHead
        id="projects-title"
        title="Projects"
        note="Client work and personal builds, each with its source. Student projects are at the end."
      />
      <div className="section__body projects">
        {featured.map((p) => (
          <Featured key={p.id} project={p} />
        ))}
        <div className="projects__grid">
          {selected.map((p) => (
            <Card key={p.id} project={p} />
          ))}
        </div>
        <div className="earlier">
          <h3 className="earlier__title">
            Earlier work <span className="earlier__note">From my master’s</span>
          </h3>
          <ul className="earlier__list">
            {earlierProjects.map((p) => (
              <li key={p.id} id={p.id} className="earlier__item">
                <p className="earlier__date num">{p.date}</p>
                <div className="earlier__main">
                  <h4 className="earlier__name">{p.name}</h4>
                  <p className="earlier__summary">{p.summary}</p>
                  <p className="earlier__stack">{p.stack.join(' · ')}</p>
                </div>
                <p className="earlier__link">
                  {p.repo ? (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      <GitHubIcon size={15} /> Source
                    </a>
                  ) : (
                    <span className="earlier__private">No public repo</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
