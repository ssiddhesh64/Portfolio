import React, { useEffect, useId, useState } from 'react';

/*
 * Two files in two repositories, named the way Git names a blob: the SHA-1 of
 * "blob <byte length>\0<content>", exactly what `git hash-object` prints.
 * Same content gives the same name, so the object is stored once.
 */

const DEFAULT = 'MIT License';
/** Precomputed so the first render (and the prerendered HTML) needs no crypto. */
const KNOWN: Record<string, string> = {
  [DEFAULT]: 'df278d3720ce04a05309f4571f6ac751095ec674',
};

async function blobId(text: string) {
  const body = new TextEncoder().encode(text);
  const head = new TextEncoder().encode(`blob ${body.length}\0`);
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  const digest = await crypto.subtle.digest('SHA-1', all);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

const FILES = ['your-repo/LICENSE', 'a-fork/LICENSE'];

export const ContentHash: React.FC = () => {
  const [texts, setTexts] = useState([DEFAULT, DEFAULT]);
  const [ids, setIds] = useState<Record<string, string>>(KNOWN);
  const base = useId();

  useEffect(() => {
    if (!globalThis.crypto?.subtle) return;
    let live = true;
    for (const t of texts) {
      if (ids[t]) continue;
      blobId(t).then((id) => {
        if (live) setIds((m) => ({ ...m, [t]: id }));
      });
    }
    return () => {
      live = false;
    };
  }, [texts, ids]);

  const same = texts[0] === texts[1];

  return (
    <div className="spec">
      <div className="spec__files">
        {FILES.map((name, i) => (
          <div key={name} className="spec__file">
            <label htmlFor={`${base}-${i}`} className="spec__file-name">
              {name}
            </label>
            <input
              id={`${base}-${i}`}
              className="spec__input"
              value={texts[i]}
              maxLength={60}
              spellCheck={false}
              onChange={(e) =>
                setTexts((ts) =>
                  ts.map((t, k) => (k === i ? e.target.value : t)),
                )
              }
            />
            <code
              className={same ? 'spec__hash spec__hash--same' : 'spec__hash'}
            >
              {(ids[texts[i]] ?? '').slice(0, 12) || '…'}
            </code>
          </div>
        ))}
      </div>
      <p className="spec__readout" aria-live="polite">
        {same
          ? 'Same contents, same name: one object on disk'
          : 'Different contents: two objects'}
      </p>
    </div>
  );
};
