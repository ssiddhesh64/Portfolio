import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText, Link as LinkIcon } from 'lucide-react';
import type { BlogPost } from '../../data/blogData';
import { LinkedInIcon, XIcon } from '../BrandIcons';
import { useCopy } from './useCopy';
import { absoluteUrl } from '../../lib/site';

/** The article as Markdown a reader can paste elsewhere, e.g. into an LLM. */
const toMarkdown = (post: BlogPost, source: string, url: string) => {
  const body = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/^(import|export) .*\r?\n/gm, '')
    .trim();
  return `# ${post.title}\n\n${post.summary}\n\nSource: ${url}\n\n${body}\n`;
};

interface PostActionsProps {
  post: BlogPost;
  next?: BlogPost;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, next }) => {
  const url = absoluteUrl(`/blog/${post.id}`);
  const link = useCopy();
  const markdown = useCopy();
  // Fetched up front: Safari only allows clipboard writes that happen
  // synchronously within the click.
  const [source, setSource] = useState<string>();
  useEffect(() => {
    let live = true;
    post.loadSource().then((s) => live && setSource(s));
    return () => {
      live = false;
    };
  }, [post]);

  const share = encodeURIComponent(url);
  const text = encodeURIComponent(post.title);

  return (
    <div className="post-actions" role="group" aria-label="Article actions">
      <button
        type="button"
        className="post-actions__item"
        onClick={() => link.copy(url)}
      >
        {link.state === 'copied' ? (
          <Check size={16} aria-hidden />
        ) : (
          <LinkIcon size={16} aria-hidden />
        )}
        <span aria-live="polite">
          {link.state === 'copied' ? 'Link copied' : 'Copy link'}
        </span>
      </button>
      <button
        type="button"
        className="post-actions__item"
        disabled={!source}
        onClick={() => source && markdown.copy(toMarkdown(post, source, url))}
      >
        {markdown.state === 'copied' ? (
          <Check size={16} aria-hidden />
        ) : (
          <FileText size={16} aria-hidden />
        )}
        <span aria-live="polite">
          {markdown.state === 'copied' ? 'Markdown copied' : 'Copy as Markdown'}
        </span>
      </button>
      <a
        className="post-actions__item"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkedInIcon size={16} />
        <span>
          Share<span className="visually-hidden"> on LinkedIn</span>
        </span>
      </a>
      <a
        className="post-actions__item"
        href={`https://x.com/intent/post?url=${share}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <XIcon size={16} />
        <span>
          Post<span className="visually-hidden"> on X</span>
        </span>
      </a>
      {next && (
        <Link
          to={`/blog/${next.id}`}
          className="post-actions__item post-actions__next"
        >
          <span>Next article</span>
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
};
