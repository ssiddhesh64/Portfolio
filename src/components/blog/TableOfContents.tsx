import React, { useEffect, useState } from 'react';
import type { TocItem } from './toc';

/** A heading is "current" once it scrolls above this line. */
const READING_LINE = 0.25;

const useActiveHeading = (items: TocItem[]): string | undefined => {
  const [active, setActive] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    if (items.length === 0) return;
    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let current = elements[0]?.id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      // At the very bottom the last sections may never cross the line.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atEnd) current = elements[elements.length - 1]?.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  return active;
};

/** Every h2, plus the h3s under the h2 that contains the active heading. */
const visibleItems = (items: TocItem[], active: string | undefined) => {
  const sectionOf = new Map<string, string | undefined>();
  let section: string | undefined;
  for (const item of items) {
    if (item.level === 2) section = item.id;
    sectionOf.set(item.id, section);
  }
  const current = active ? sectionOf.get(active) : undefined;
  return items.filter(
    (item) => item.level === 2 || sectionOf.get(item.id) === current,
  );
};

/**
 * "On this page": every h2, plus the h3s of the section being read, so long
 * articles keep a short list. "wide" is the sticky column beside the
 * article; "narrow" is a collapsible list under the header on small screens.
 * CSS shows exactly one of them.
 */
export const TableOfContents: React.FC<{
  items: TocItem[];
  variant: 'wide' | 'narrow';
}> = ({ items, variant }) => {
  const active = useActiveHeading(items);
  const [open, setOpen] = useState(false);
  if (items.filter((i) => i.level === 2).length < 2) return null;

  const visible = visibleItems(items, active);

  const list = (onPick?: () => void) => (
    <ol className="toc__list">
      {visible.map((item) => (
        <li key={item.id} className={`toc__item toc__item--h${item.level}`}>
          <a
            href={`#${item.id}`}
            className="toc__link"
            aria-current={item.id === active ? 'location' : undefined}
            onClick={onPick}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === 'wide') {
    return (
      <nav className="toc toc--wide" aria-label="On this page">
        <p className="toc__title">On this page</p>
        {list()}
      </nav>
    );
  }
  return (
    <details
      className="toc toc--narrow"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="toc__title">On this page</summary>
      <nav aria-label="On this page (collapsible)">
        {list(() => setOpen(false))}
      </nav>
    </details>
  );
};
