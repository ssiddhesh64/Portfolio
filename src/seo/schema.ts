/**
 * Schema.org JSON-LD builders. Every value comes from resumeData.ts or an
 * article's frontmatter, so the markup always matches what the page shows.
 * Nodes reference each other by @id, so the Person is described once per page.
 */
import type { BlogPost } from '../data/blogData';
import type { BlogCategory } from '../data/blogCategories';
import { education, personalInfo, skills } from '../data/resumeData';
import {
  DEFAULT_OG_IMAGE,
  SITE_LANGUAGE,
  SITE_NAME,
  absoluteUrl,
} from '../lib/site';

const PERSON_ID = absoluteUrl('/') + '#person';
const WEBSITE_ID = absoluteUrl('/') + '#website';
const BLOG_ID = absoluteUrl('/blog') + '#blog';

const fullName = `${personalInfo.name} ${personalInfo.lastName}`;
const personRef = { '@id': PERSON_ID };

/** Frontmatter dates are calendar days in Bangalore. */
export const isoDate = (day: string) => `${day}T00:00:00+05:30`;

export const personNode = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: fullName,
  givenName: personalInfo.name,
  familyName: personalInfo.lastName,
  url: absoluteUrl('/'),
  jobTitle: personalInfo.title,
  description: personalInfo.focus,
  email: `mailto:${personalInfo.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bangalore',
    addressCountry: 'IN',
  },
  sameAs: [personalInfo.github, personalInfo.linkedin],
  knowsAbout: [
    ...new Set([...personalInfo.expertise, ...skills.flatMap((s) => s.items)]),
  ],
  alumniOf: education.map((e) => ({
    '@type': 'CollegeOrUniversity',
    name: e.school,
  })),
});

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: absoluteUrl('/'),
  name: SITE_NAME,
  inLanguage: SITE_LANGUAGE,
  publisher: personRef,
});

/** Home: a profile page about the Person. */
export const profilePageNode = (description: string) => ({
  '@type': 'ProfilePage',
  '@id': absoluteUrl('/') + '#webpage',
  url: absoluteUrl('/'),
  name: SITE_NAME,
  description,
  inLanguage: SITE_LANGUAGE,
  isPartOf: { '@id': WEBSITE_ID },
  mainEntity: personRef,
});

interface Crumb {
  name: string;
  path: string;
}

export const breadcrumbNode = (crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

const postSummary = (post: BlogPost) => ({
  '@type': 'BlogPosting',
  '@id': absoluteUrl(`/blog/${post.id}`) + '#article',
  headline: post.title,
  url: absoluteUrl(`/blog/${post.id}`),
  datePublished: isoDate(post.date),
});

export const blogNode = (description: string, posts: BlogPost[]) => ({
  '@type': 'Blog',
  '@id': BLOG_ID,
  url: absoluteUrl('/blog'),
  name: `${SITE_NAME}: Writing`,
  description,
  inLanguage: SITE_LANGUAGE,
  isPartOf: { '@id': WEBSITE_ID },
  author: personRef,
  publisher: personRef,
  blogPost: posts.map(postSummary),
});

export const categoryPageNode = (
  category: BlogCategory,
  path: string,
  posts: BlogPost[],
) => ({
  '@type': 'CollectionPage',
  '@id': absoluteUrl(path) + '#webpage',
  url: absoluteUrl(path),
  name: category.title,
  description: category.description,
  inLanguage: SITE_LANGUAGE,
  isPartOf: { '@id': WEBSITE_ID },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/blog/${p.id}`),
      name: p.title,
    })),
  },
});

export const blogPostingNode = (post: BlogPost) => {
  const url = absoluteUrl(`/blog/${post.id}`);
  return {
    ...postSummary(post),
    description: post.description,
    dateModified: isoDate(post.updated ?? post.date),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: fullName,
      url: absoluteUrl('/'),
    },
    publisher: personRef,
    image: {
      '@type': 'ImageObject',
      url: absoluteUrl(DEFAULT_OG_IMAGE.path),
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
    },
    articleSection: post.category.title,
    keywords: post.tags.join(', '),
    inLanguage: SITE_LANGUAGE,
    isPartOf: { '@id': BLOG_ID },
  };
};
