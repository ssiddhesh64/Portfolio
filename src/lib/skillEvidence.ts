import { findPost, blogPosts } from '../data/blogData';
import {
  projects,
  roleDetails,
  roles,
  type SkillItem,
} from '../data/resumeData';
import { formatYearMonth, formatRange } from './dates';

export type EvidenceKind = 'role' | 'project' | 'article' | 'link' | 'personal';

export interface EvidenceEntry {
  kind: EvidenceKind;
  title: string;
  /** Role title, project date or article date. */
  meta?: string;
  /** The line on the site that shows the skill in use, when there is one. */
  note?: string;
  /**
   * A same-page anchor (/#walmart), a route (/blog/…) or an external URL.
   * Missing only for personal work, which has nothing to link to.
   */
  href?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The first line that names the skill, so the panel quotes the page. */
const quote = (lines: string[], terms: string[]) => {
  const re = new RegExp(
    `(^|[^\\w])(${terms.map(escape).join('|')})(?![\\w+#])`,
    'i',
  );
  return lines.find((l) => re.test(l));
};

/** "2026-06-21" -> "Jun 2026" */
const formatArticleDate = (iso: string) => formatYearMonth(iso.slice(0, 7));

/**
 * Where a skill appears on the site: roles and projects whose stack lists it,
 * articles tagged with it, and any extra evidence written in resumeData.
 * Work comes first, newest first, then projects, then writing. Explicit
 * evidence wins over a bare tag match because it carries a note.
 */
export function evidenceFor(skill: SkillItem): EvidenceEntry[] {
  const terms = skill.matches ?? [skill.name];
  const has = (list: string[]) =>
    list.some((x) => terms.some((t) => t.toLowerCase() === x.toLowerCase()));

  const explicit = skill.evidence ?? [];
  const roleNote = (id: string) =>
    explicit.find((e) => e.kind === 'role' && e.roleId === id)?.note;
  for (const e of explicit) {
    // Fails the prerender, so a renamed role can't leave a dead claim.
    if (e.kind === 'role' && !roles.some((r) => r.id === e.roleId)) {
      throw new Error(`Skill "${skill.name}": no role "${e.roleId}"`);
    }
  }

  // A role counts when its stack lists the skill or resumeData names it.
  // A line from the role that names the skill beats a written note.
  const fromRoles: EvidenceEntry[] = roles
    .filter((r) => has(r.stack) || roleNote(r.id))
    .map((r) => ({
      kind: 'role',
      title: r.org,
      meta: `${r.title}, ${formatRange(r.start, r.end)}`,
      note: quote(roleDetails(r), terms) ?? roleNote(r.id),
      href: `/#${r.id}`,
    }));

  const fromProjects: EvidenceEntry[] = projects
    .filter((p) => has(p.stack))
    .map((p) => ({
      kind: 'project',
      title: p.name,
      meta: p.date,
      note: quote([p.summary, ...p.details], terms) ?? p.summary,
      href: `/#${p.id}`,
    }));

  const fromTags: EvidenceEntry[] = blogPosts
    .filter((post) => has(post.tags))
    .map((post) => ({
      kind: 'article',
      title: post.title,
      meta: formatArticleDate(post.date),
      href: `/blog/${post.id}`,
    }));

  const extra: EvidenceEntry[] = explicit.flatMap((e): EvidenceEntry[] => {
    if (e.kind === 'role') return [];
    if (e.kind === 'personal') {
      return [{ kind: 'personal', title: 'Personal projects', note: e.note }];
    }
    if (e.kind === 'link') {
      return [{ kind: 'link', title: e.title, note: e.note, href: e.href }];
    }
    const post = findPost(e.slug);
    // Fails the prerender, so a renamed article can't leave a dead claim.
    if (!post) throw new Error(`Skill "${skill.name}": no article "${e.slug}"`);
    return [
      {
        kind: 'article',
        title: post.title,
        meta: formatArticleDate(post.date),
        note: e.note,
        href: `/blog/${post.id}`,
      },
    ];
  });

  const seen = new Set<string>();
  return [...fromRoles, ...fromProjects, ...extra, ...fromTags].filter((e) => {
    const key = e.href ?? e.title;
    return seen.has(key) ? false : (seen.add(key), true);
  });
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** "2 roles · 1 project", or "" when nothing on the site shows the skill. */
export function evidenceSummary(entries: EvidenceEntry[]): string {
  const count = (k: EvidenceKind) => entries.filter((e) => e.kind === k).length;
  return [
    count('role') && plural(count('role'), 'role'),
    count('project') && plural(count('project'), 'project'),
    count('article') && plural(count('article'), 'article'),
    count('link') && 'This site',
    count('personal') && 'personal work',
  ]
    .filter(Boolean)
    .join(' · ');
}
