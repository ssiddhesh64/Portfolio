import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Check, Copy } from 'lucide-react';
import { personalInfo } from '../data/resumeData';
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons';
import { SectionHead } from '../components/SectionHead';

type CopyState = 'idle' | 'copied' | 'failed';

const CopyEmail: React.FC = () => {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2400);
  };

  return (
    <>
      <button type="button" className="button" onClick={copy}>
        {state === 'copied' ? (
          <Check size={18} aria-hidden />
        ) : (
          <Copy size={18} aria-hidden />
        )}
        {state === 'copied' ? 'Copied' : 'Copy email'}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {state === 'copied' && 'Email address copied to clipboard.'}
      </span>
      {state === 'failed' && (
        <p className="contact__error" role="alert">
          Your browser blocked clipboard access. Select the address above and
          copy it manually.
        </p>
      )}
    </>
  );
};

export const Contact: React.FC = () => (
  <section
    className="section wrap"
    id="contact"
    aria-labelledby="contact-title"
  >
    <SectionHead id="contact-title" title="Contact" />
    <div className="section__body contact">
      <p className="contact__lede">
        {personalInfo.availability} Email is the quickest way to reach me.
      </p>
      <p className="contact__email">
        <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
      </p>
      <div className="actions">
        <CopyEmail />
        <a
          href={personalInfo.resumeUrl}
          download={personalInfo.resumeFileName}
          className="button"
        >
          <ArrowDownToLine size={18} aria-hidden />
          Download resume
        </a>
      </div>
      <ul className="link-row" aria-label="Other ways to reach me">
        <li>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon size={16} /> LinkedIn
          </a>
        </li>
        <li>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon size={16} /> GitHub
          </a>
        </li>
      </ul>
    </div>
  </section>
);
