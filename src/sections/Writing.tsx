import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import { writingHooks } from '../data/writingHooks';
import { formatPostDate } from '../lib/dates';
import { SectionHead } from '../components/SectionHead';

export const Writing: React.FC = () => (
  <section
    className="section wrap"
    id="writing"
    aria-labelledby="writing-title"
  >
    <SectionHead
      id="writing-title"
      title="Writing"
      note="Each article answers one question, with a working demo you can try here."
    />
    <div className="section__body">
      <ul className="essays">
        {blogPosts.map((post) => {
          const hook = writingHooks[post.id];
          const Specimen = hook?.Specimen;
          return (
            <li key={post.id} className="essay">
              <div className="essay__text">
                <h3 className="essay__title">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                {hook ? (
                  <div className="essay__qa">
                    <p className="essay__q">{hook.question}</p>
                    <p className="essay__a">{hook.answer}</p>
                  </div>
                ) : (
                  <p className="essay__a">{post.summary}</p>
                )}
                <p className="essay__meta num">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>,{' '}
                  {post.readTime}
                </p>
              </div>
              {Specimen && (
                <figure className="essay__spec">
                  <figcaption className="essay__prompt">
                    {hook.prompt}
                  </figcaption>
                  <Specimen />
                </figure>
              )}
            </li>
          );
        })}
      </ul>
      <p className="section__more">
        <Link to="/blog">All articles, with summaries</Link>
      </p>
    </div>
  </section>
);
