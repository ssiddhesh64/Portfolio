import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  categoryPath,
  findPost,
  neighbours,
  type BlogPost as Post,
} from '../data/blogData';
import type { PageMeta } from '../seo/head';
import { personalInfo } from '../data/resumeData';
import { formatPostDate } from '../lib/dates';
import { useMetadata } from '../hooks/useMetadata';
import {
  blogPostingNode,
  breadcrumbNode,
  isoDate,
  personNode,
  websiteNode,
} from '../seo/schema';
import { mdxComponents } from '../components/blog/mdxComponents';
import { PostActions } from '../components/blog/PostActions';
import { PostNav } from '../components/blog/PostNav';
import { TableOfContents } from '../components/blog/TableOfContents';
import { readHeadings, type TocItem } from '../components/blog/toc';
import { NotFound } from './NotFound';

const BRAND = ' | Siddhesh Sawant';
/** Past this, search results cut the title off; the brand goes first. */
const TITLE_BUDGET = 65;

const postMeta = (post: Post): PageMeta => {
  const path = `/blog/${post.id}`;
  const withBrand = post.seoTitle + BRAND;
  return {
    title: withBrand.length <= TITLE_BUDGET ? withBrand : post.seoTitle,
    description: post.description,
    path,
    type: 'article',
    publishedTime: isoDate(post.date),
    modifiedTime: isoDate(post.updated ?? post.date),
    section: post.category.title,
    tags: post.tags,
    jsonLd: [
      websiteNode(),
      personNode(),
      blogPostingNode(post),
      breadcrumbNode([
        { name: 'Home', path: '/' },
        { name: 'Writing', path: '/blog' },
        { name: post.category.title, path: categoryPath(post.category) },
        { name: post.title, path },
      ]),
    ],
  };
};

/** Renders nothing; its effect runs once the article body above it has loaded. */
const OnLoaded: React.FC<{ onLoaded: () => void }> = ({ onLoaded }) => {
  useEffect(onLoaded, [onLoaded]);
  return null;
};

export const BlogPost: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { hash } = useLocation();
  const post = findPost(id);
  const body = useRef<HTMLDivElement>(null);
  // Tagged with the article it came from, so a stale list never shows.
  const [toc, setToc] = useState<{ id: string; items: TocItem[] }>();

  useMetadata(post ? postMeta(post) : null);

  const onLoaded = useCallback(() => {
    if (!body.current) return;
    setToc({ id, items: readHeadings(body.current) });
    // The body loads after navigation, so a #section link can only be
    // honoured once it exists.
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, id]);

  if (!post) return <NotFound kind="article" />;

  const { previous, next } = neighbours(post);
  const { Content } = post;
  const tocItems = toc?.id === post.id ? toc.items : [];

  return (
    <article className="post">
      <div className="post__band post__band--head">
        <header className="post__col post__head">
          <p className="reading__back">
            <Link to="/blog">
              <ArrowLeft size={16} aria-hidden /> All articles
            </Link>
          </p>
          <h1 className="post__title">{post.title}</h1>
          <p className="post__summary">{post.summary}</p>
          <p className="post__byline">
            <span>
              {personalInfo.name} {personalInfo.lastName}
            </span>
            <time dateTime={post.date} className="num">
              {formatPostDate(post.date)}
            </time>
            {post.updated && (
              <span>
                Updated{' '}
                <time dateTime={post.updated} className="num">
                  {formatPostDate(post.updated)}
                </time>
              </span>
            )}
            <span className="num">{post.readTime}</span>
            <span>
              In{' '}
              <Link to={categoryPath(post.category)}>
                {post.category.title}
              </Link>
            </span>
            {post.series && (
              <span>
                Part <span className="num">{post.series.order}</span> of{' '}
                <span className="num">{post.series.total}</span>,{' '}
                {post.series.name}
              </span>
            )}
          </p>
        </header>
        <div className="post__rail post__rail--actions">
          <PostActions post={post} next={next} />
        </div>
      </div>

      <div className="post__band post__band--body">
        <div className="post__col">
          <TableOfContents key={post.id} items={tocItems} variant="narrow" />
          <div className="prose" ref={body}>
            <Suspense
              key={post.id}
              fallback={
                <p className="post__loading" role="status">
                  Loading article
                </p>
              }
            >
              <Content components={mdxComponents} />
              <OnLoaded onLoaded={onLoaded} />
            </Suspense>
          </div>

          <footer className="post__foot">
            <PostNav previous={previous} next={next} />
            <p>
              Questions or corrections?{' '}
              <a
                href={`mailto:${personalInfo.email}?subject=${encodeURIComponent(post.title)}`}
              >
                Email me about this article
              </a>
              .
            </p>
          </footer>
        </div>
        <aside className="post__rail" aria-label="Article navigation">
          <TableOfContents key={post.id} items={tocItems} variant="wide" />
        </aside>
      </div>
    </article>
  );
};
