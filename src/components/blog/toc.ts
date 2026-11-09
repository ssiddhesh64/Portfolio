export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Reads the article's h2/h3 headings once its content has rendered. */
export const readHeadings = (root: HTMLElement): TocItem[] =>
  Array.from(root.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]')).map(
    (h) => ({
      id: h.id,
      text: (h.textContent ?? '').trim(),
      level: h.tagName === 'H2' ? 2 : 3,
    }),
  );
