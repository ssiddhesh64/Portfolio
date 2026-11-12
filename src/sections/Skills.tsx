import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { skills, type SkillItem } from '../data/resumeData';
import { SectionHead } from '../components/SectionHead';
import { SkillIcon } from '../components/SkillIcon';
import { skillIconStyle } from '../lib/skillMarks';
import {
  evidenceFor,
  evidenceSummary,
  type EvidenceEntry,
  type EvidenceKind,
} from '../lib/skillEvidence';

const KIND_LABEL: Record<EvidenceKind, string> = {
  role: 'Work',
  project: 'Project',
  article: 'Article',
  link: 'Source',
  personal: 'Personal',
};

/** Hover intent: long enough to cross the gap into the panel. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 180;
/** Matches the 24rem max width of .skill-proof. */
const PANEL_WIDTH = 384;

const EvidenceLink: React.FC<{ entry: EvidenceEntry; onGo: () => void }> = ({
  entry,
  onGo,
}) => {
  const body = (
    <>
      <span className="skill-proof__title">{entry.title}</span>
      {entry.kind === 'link' && <ArrowUpRight size={14} aria-hidden />}
    </>
  );
  if (!entry.href) {
    return <span className="skill-proof__plain">{body}</span>;
  }
  if (entry.href.startsWith('/blog/')) {
    return (
      <Link to={entry.href} onClick={onGo}>
        {body}
      </Link>
    );
  }
  const external = /^https?:/.test(entry.href);
  return (
    <a
      href={entry.href}
      onClick={onGo}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {body}
    </a>
  );
};

interface SkillTileProps {
  skill: SkillItem;
  open: boolean;
  onOpen: (name: string) => void;
  /** Closes this tile's panel, and only this one's. */
  onClose: (name: string) => void;
}

const SkillTile: React.FC<SkillTileProps> = ({
  skill,
  open,
  onOpen,
  onClose,
}) => {
  const entries = evidenceFor(skill);
  const summary = evidenceSummary(entries);
  const panelId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [alignEnd, setAlignEnd] = useState(false);

  const schedule = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  const place = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    // The panel is wider than a tile; flip it to the tile's right edge when
    // it would run off the viewport.
    if (!rect) return;
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
    setAlignEnd(rect.left + width > window.innerWidth - 16);
  };

  const close = () => onClose(skill.name);

  const show = () => {
    place();
    onOpen(skill.name);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose(skill.name);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, onClose, skill.name]);

  const mouse = (e: React.PointerEvent) => e.pointerType === 'mouse';

  return (
    <li
      ref={rootRef}
      style={skillIconStyle(skill.icon)}
      className={`skill${open ? ' is-open' : ''}${entries.length ? '' : ' is-unproven'}`}
      onPointerEnter={(e) => mouse(e) && schedule(show, OPEN_DELAY)}
      onPointerLeave={(e) =>
        mouse(e) &&
        schedule(() => {
          if (!rootRef.current?.contains(document.activeElement)) close();
        }, CLOSE_DELAY)
      }
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) close();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="skill__tile"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          window.clearTimeout(timer.current);
          if (open) close();
          else show();
        }}
      >
        <span className="skill__icon">
          <SkillIcon icon={skill.icon} />
        </span>
        <span className="skill__text">
          <span className="skill__name">{skill.name}</span>
          <span className="skill__summary">
            {summary || 'Not shown on this site yet'}
          </span>
        </span>
      </button>
      <div
        id={panelId}
        className={`skill-proof${alignEnd ? ' skill-proof--end' : ''}`}
        role="region"
        aria-label={`Where ${skill.name} was used`}
        hidden={!open}
      >
        <p className="skill-proof__head">
          Where I used <strong>{skill.name}</strong>
        </p>
        {entries.length ? (
          <ul className="skill-proof__list">
            {entries.map((entry) => (
              <li key={entry.href ?? entry.title} className="skill-proof__item">
                <span className="skill-proof__kind">
                  {KIND_LABEL[entry.kind]}
                </span>
                <div>
                  <EvidenceLink entry={entry} onGo={() => close()} />
                  {entry.meta && (
                    <p className="skill-proof__meta num">{entry.meta}</p>
                  )}
                  {entry.note && (
                    <p className="skill-proof__note">{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="skill-proof__empty">
            Nothing on this site shows it yet. Ask me about it.
          </p>
        )}
      </div>
    </li>
  );
};

export const Skills: React.FC = () => {
  const [openSkill, setOpenSkill] = useState<string | null>(null);
  const close = useCallback(
    (name: string) => setOpenSkill((cur) => (cur === name ? null : cur)),
    [],
  );

  return (
    <section
      className="section wrap"
      id="skills"
      aria-labelledby="skills-title"
    >
      <SectionHead
        id="skills-title"
        title="Skills"
        note="Hover or tap a skill to see where I used it. Work, projects and articles link to where they appear on this site."
      />
      <div className="section__body skills">
        {skills.map((group) => (
          <div key={group.category} className="skills__row">
            <h3 className="skills__category">{group.category}</h3>
            <ul className="skills__grid">
              {group.items.map((skill) => (
                <SkillTile
                  key={skill.name}
                  skill={skill}
                  open={openSkill === skill.name}
                  onOpen={setOpenSkill}
                  onClose={close}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
