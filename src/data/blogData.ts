import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { blogCategories, type BlogCategory } from './blogCategories';

/**
 * Each article is a folder inside its category's folder:
 * content/blogs/<category>/<slug>/index.mdx, with its images beside it. The
 * category must be registered in blogCategories.ts. The slug is the URL
 * (/blog/<slug>), must be unique across all categories and must not change
 * once published. Moving an article to another category keeps its URL.
 *
 * Frontmatter:
 *   title       required
 *   date        required, YYYY-MM-DD
 *   summary     required, shown as the subtitle
 *   description optional meta description (aim for 120–160 characters);
 *               defaults to the summary, which search engines truncate
 *   seoTitle    optional shorter <title> for search results when the
 *               headline is long; the page still shows `title`
 *   tags        optional list
 *   updated     optional YYYY-MM-DD, shown as "Updated …"
 *   readTime    optional; derived from the word count when absent
 *   series      optional series name; posts sharing it link to each other
 *   seriesOrder required with series, 1-based position in the series
 */
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  summary: string;
  /** Meta description: frontmatter `description`, or the summary. */
  description: string;
  /** The <title> for search results: frontmatter `seoTitle`, or the title. */
  seoTitle: string;
  tags: string[];
  category: BlogCategory;
  readTime: string;
  updated?: string;
  series?: { name: string; order: number; total: number };
  Content: LazyExoticComponent<ComponentType<{ components?: object }>>;
  /** The article's MDX source, for "Copy as Markdown". */
  loadSource: () => Promise<string>;
}

type MdxModule = { default: ComponentType<{ components?: object }> };

const meta = import.meta.glob<Record<string, unknown>>(
  '../content/blogs/*/*/index.mdx',
  { query: '?frontmatter', import: 'default', eager: true },
);
const bodies = import.meta.glob<MdxModule>('../content/blogs/*/*/index.mdx');
const sources = import.meta.glob<string>('../content/blogs/*/*/index.mdx', {
  query: '?raw',
  import: 'default',
});

const segments = (path: string) => {
  const [category, slug] = path.split('/').slice(-3, -1);
  return { category, slug };
};

const categoryById = new Map(blogCategories.map((c) => [c.id, c]));

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function required(slug: string, data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Article "${slug}": frontmatter needs a "${key}".`);
  }
  return value.trim();
}

function toPost(path: string, data: Record<string, unknown>) {
  const { category: categoryId, slug: id } = segments(path);
  const category = categoryById.get(categoryId);
  if (!category) {
    throw new Error(
      `Article "${id}": folder "${categoryId}" is not a category. Add it to src/data/blogCategories.ts.`,
    );
  }
  const date = required(id, data, 'date');
  if (!DATE.test(date)) {
    throw new Error(`Article "${id}": date must be YYYY-MM-DD, got "${date}".`);
  }
  const updated =
    typeof data.updated === 'string' && DATE.test(data.updated)
      ? data.updated
      : undefined;
  const seriesName = typeof data.series === 'string' ? data.series : undefined;
  const seriesOrder = Number(data.seriesOrder);
  if (seriesName && !Number.isInteger(seriesOrder)) {
    throw new Error(`Article "${id}": series needs an integer seriesOrder.`);
  }

  const title = required(id, data, 'title');
  const summary = required(id, data, 'summary');
  const optional = (key: string) => {
    const value = data[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };

  return {
    id,
    title,
    date,
    summary,
    description: optional('description') ?? summary,
    seoTitle: optional('seoTitle') ?? title,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    category,
    readTime: String(data.readTime),
    updated,
    seriesName,
    seriesOrder,
    Content: lazy(bodies[path]),
    loadSource: sources[path],
  };
}

const drafts = Object.entries(meta).map(([path, data]) => toPost(path, data));

const seen = new Map<string, string>();
for (const d of drafts) {
  const other = seen.get(d.id);
  if (other) {
    throw new Error(
      `Article "${d.id}" exists in both "${other}" and "${d.category.id}". Slugs are URLs and must be unique.`,
    );
  }
  seen.set(d.id, d.category.id);
}

const seriesTotals = new Map<string, number>();
for (const d of drafts) {
  if (d.seriesName) {
    seriesTotals.set(d.seriesName, (seriesTotals.get(d.seriesName) ?? 0) + 1);
  }
}

const byDateThenId = (a: BlogPost, b: BlogPost) =>
  a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date);

/** Oldest first: the order a reader would follow from one article to the next. */
const readingOrder: BlogPost[] = drafts
  .map(({ seriesName, seriesOrder, ...rest }) => ({
    ...rest,
    series: seriesName
      ? {
          name: seriesName,
          order: seriesOrder,
          total: seriesTotals.get(seriesName) ?? 1,
        }
      : undefined,
  }))
  .sort(byDateThenId);

/** Newest first, for the blog index. */
export const blogPosts: BlogPost[] = [...readingOrder].reverse();

export const findPost = (id: string) => blogPosts.find((p) => p.id === id);

export const categoryPath = (category: BlogCategory) =>
  `/blog/category/${category.id}`;

export interface CategoryWithPosts extends BlogCategory {
  /** Newest first. */
  posts: BlogPost[];
}

/** Categories in registry order, each with its articles. Empty categories are left out. */
export const categoriesWithPosts: CategoryWithPosts[] = blogCategories
  .map((c) => ({
    ...c,
    posts: blogPosts.filter((p) => p.category.id === c.id),
  }))
  .filter((c) => c.posts.length > 0);

export const findCategory = (id: string) =>
  categoriesWithPosts.find((c) => c.id === id);

/**
 * Previous and next article. Within a series they follow the series order;
 * otherwise they follow publication date, oldest to newest.
 */
export function neighbours(post: BlogPost): {
  previous?: BlogPost;
  next?: BlogPost;
} {
  const list = post.series
    ? readingOrder
        .filter((p) => p.series?.name === post.series?.name)
        .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
    : readingOrder.filter((p) => !p.series);
  const i = list.findIndex((p) => p.id === post.id);
  return { previous: list[i - 1], next: list[i + 1] };
}
