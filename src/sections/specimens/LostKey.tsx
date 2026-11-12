import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/*
 * An Employee whose hashCode() is its id, added to a HashSet while id = 3.
 * HashMap's default table has 16 buckets and, for small ints, the bucket is
 * id & 15. The node remembers the hash it was filed under, so contains()
 * fails both when the new id lands in another bucket and when it lands in
 * the same bucket with a different hash (e.g. 19).
 */

const STORED = 3;
const BUCKETS = 16;
const W = 240;
const CELL = (W - 4) / BUCKETS;
const bucketOf = (h: number) => (h ^ (h >>> 16)) & (BUCKETS - 1);

export const LostKey: React.FC = () => {
  const [id, setId] = useState(5);
  const looks = bucketOf(id);
  const found = id === STORED;
  const reason = found
    ? 'Same hash, same bucket: found'
    : looks === bucketOf(STORED)
      ? `Right bucket, but the node cached hash ${STORED}, not ${id}`
      : `Looks in bucket ${looks}; the object is in bucket ${bucketOf(STORED)}`;

  return (
    <div className="spec">
      <svg className="spec__plot" viewBox={`0 0 ${W} 86`} aria-hidden>
        {Array.from({ length: BUCKETS }, (_, i) => (
          <rect
            key={i}
            className={
              i === looks ? 'spec__cell spec__cell--probe' : 'spec__cell'
            }
            x={2 + i * CELL}
            y={38}
            width={CELL - 2}
            height={22}
            rx={2}
          />
        ))}
        <circle
          className="spec__dot"
          cx={2 + bucketOf(STORED) * CELL + (CELL - 2) / 2}
          cy={49}
          r={4}
        />
        <text className="spec__label" x={2 + bucketOf(STORED) * CELL} y={78}>
          e, filed as hash {STORED}
        </text>
        <path
          className="spec__probe"
          d={`M${2 + looks * CELL + (CELL - 2) / 2} 16 v18`}
          markerEnd="url(#spec-arrow)"
        />
        <text
          className="spec__label"
          x={clampLabel(2 + looks * CELL + (CELL - 2) / 2)}
          y={12}
          textAnchor="middle"
          dy={-1}
        >
          contains(e)
        </text>
        <defs>
          <marker
            id="spec-arrow"
            viewBox="0 0 8 8"
            refX={4}
            refY={4}
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M0 0 8 4 0 8z" className="spec__arrowhead" />
          </marker>
        </defs>
      </svg>
      <div className="spec__controls">
        <button
          type="button"
          className="spec__btn"
          aria-label="Decrease id"
          onClick={() => setId((v) => Math.max(0, v - 1))}
        >
          <Minus size={14} aria-hidden />
        </button>
        <code className="spec__code">e.id = {id}</code>
        <button
          type="button"
          className="spec__btn"
          aria-label="Increase id"
          onClick={() => setId((v) => Math.min(40, v + 1))}
        >
          <Plus size={14} aria-hidden />
        </button>
        <code className={found ? 'spec__code' : 'spec__code spec__code--bad'}>
          {String(found)}
        </code>
      </div>
      <p className="spec__readout" aria-live="polite">
        {reason}
      </p>
    </div>
  );
};

/** Keep the "contains(e)" label inside the drawing near the edges. */
function clampLabel(x: number) {
  return Math.min(W - 32, Math.max(32, x));
}
