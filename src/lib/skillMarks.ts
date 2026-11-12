import type React from 'react';
import { Cloud, Database, Orbit, type LucideIcon } from 'lucide-react';
import {
  siApachekafka,
  siCplusplus,
  siDocker,
  siElasticsearch,
  siFlask,
  siGit,
  siGooglecloud,
  siJavascript,
  siKubernetes,
  siNumpy,
  siPostgresql,
  siPython,
  siReact,
  siSap,
  siScikitlearn,
  siSpringboot,
  siSqlite,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';
import type { SkillIconId } from '../data/resumeData';

/** A drawing of the mark, in the current colour unless it paints its own. */
type Glyph =
  | {
      kind: 'simple';
      icon: SimpleIcon;
      /** Fills the cut-out letters. */ inset?: string;
    }
  | { kind: 'lucide'; icon: LucideIcon }
  | { kind: 'java' };

interface Mark {
  glyph: Glyph;
  /** Brand colour on the light theme. */
  light: string;
  /**
   * Brand colour on the dark theme, when the light one is too dark to read
   * on a near-black surface. 'ink' uses the theme's text colour.
   */
  dark?: string;
  /** A second colour, for marks with two (Java's cup). */
  second?: { light: string; dark: string };
}

const simple = (icon: SimpleIcon, inset?: string): Glyph => ({
  kind: 'simple',
  icon,
  inset,
});
const lucide = (icon: LucideIcon): Glyph => ({ kind: 'lucide', icon });

/*
 * Brand marks come from Simple Icons, in each brand's own colour, adjusted
 * where the official colour has too little contrast on one of the themes.
 * Oracle and Microsoft marks aren't in Simple Icons and SQL has no logo, so
 * Java is drawn here and the rest use Lucide glyphs in a brand colour.
 */
export const MARKS: Record<SkillIconId, Mark> = {
  java: {
    glyph: { kind: 'java' },
    light: '#e76f00',
    dark: '#f08a2c',
    second: { light: '#5382a1', dark: '#7fa8c9' },
  },
  python: { glyph: simple(siPython), light: '#3776ab', dark: '#5a9fd4' },
  cpp: { glyph: simple(siCplusplus), light: '#00599c', dark: '#659ad2' },
  sql: { glyph: lucide(Database), light: '#c2410c', dark: '#f0883e' },
  javascript: { glyph: simple(siJavascript, '#1a1a19'), light: '#f7df1e' },
  typescript: { glyph: simple(siTypescript, '#ffffff'), light: '#3178c6' },
  'spring-boot': { glyph: simple(siSpringboot), light: '#6db33f' },
  kafka: { glyph: simple(siApachekafka), light: '#231f20', dark: 'ink' },
  react: { glyph: simple(siReact), light: '#087ea4', dark: '#61dafb' },
  flask: { glyph: simple(siFlask), light: '#1f8a99', dark: '#3babc3' },
  'scikit-learn': { glyph: simple(siScikitlearn), light: '#f7931e' },
  numpy: { glyph: simple(siNumpy), light: '#4d77cf', dark: '#4dabcf' },
  azure: { glyph: lucide(Cloud), light: '#0078d4', dark: '#3ca2f0' },
  gcp: { glyph: simple(siGooglecloud), light: '#4285f4' },
  docker: { glyph: simple(siDocker), light: '#2496ed' },
  kubernetes: {
    glyph: simple(siKubernetes),
    light: '#326ce5',
    dark: '#5b8cf0',
  },
  git: { glyph: simple(siGit), light: '#f03c2e' },
  postgresql: {
    glyph: simple(siPostgresql),
    light: '#336791',
    dark: '#6d9bd1',
  },
  'cosmos-db': { glyph: lucide(Orbit), light: '#0078d4', dark: '#3ca2f0' },
  elasticsearch: {
    glyph: simple(siElasticsearch),
    light: '#00a39a',
    dark: '#00bfb3',
  },
  sqlite: { glyph: simple(siSqlite), light: '#0f80cc', dark: '#44a8e0' },
  sap: { glyph: simple(siSap), light: '#0a6ed1', dark: '#0faaff' },
};

/** Inline custom properties read by .skill__icon in index.css. */
export const skillIconStyle = (icon: SkillIconId): React.CSSProperties => {
  const { light, dark, second } = MARKS[icon];
  return {
    '--brand': light,
    '--brand-dark': dark === 'ink' ? 'var(--text-primary)' : (dark ?? light),
    '--brand-2': second?.light ?? light,
    '--brand-2-dark': second?.dark ?? second?.light ?? light,
  } as React.CSSProperties;
};
