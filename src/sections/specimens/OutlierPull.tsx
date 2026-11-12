import React, { useState } from 'react';
import { clamp, dragHandlers, sliderKeys } from './drag';

/*
 * The article's five courier deliveries plus one point the reader drags.
 * The solid line is the least-squares fit to all six; the dashed line is the
 * fit to the original five, so the gap between them is the outlier's pull.
 */

type Pt = { x: number; y: number };
const COURIER: Pt[] = [
  { x: 1, y: 20 },
  { x: 2, y: 40 },
  { x: 3, y: 50 },
  { x: 4, y: 40 },
  { x: 5, y: 50 },
];
const OUT_X = 7;

const W = 240;
const H = 132;
const P = 10;
const sx = (x: number) => P + (x / 8) * (W - 2 * P);
const sy = (y: number) => H - P - (y / 100) * (H - 2 * P);
const toY = (py: number) => ((H - P - py) / (H - 2 * P)) * 100;

function fit(pts: Pt[]) {
  const n = pts.length;
  const xm = pts.reduce((s, p) => s + p.x, 0) / n;
  const ym = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of pts) {
    sxy += (p.x - xm) * (p.y - ym);
    sxx += (p.x - xm) ** 2;
  }
  const w = sxy / sxx;
  return { w, b: ym - w * xm };
}

const base = fit(COURIER);

const Line: React.FC<{ w: number; b: number; className: string }> = ({
  w,
  b,
  className,
}) => (
  <line
    className={className}
    x1={sx(0)}
    y1={sy(b)}
    x2={sx(8)}
    y2={sy(w * 8 + b)}
  />
);

export const OutlierPull: React.FC = () => {
  const [y, setY] = useState(10);
  const set = (v: number) => setY(Math.round(clamp(v, 0, 100)));
  const all = fit([...COURIER, { x: OUT_X, y }]);

  return (
    <div className="spec">
      <svg
        className="spec__plot spec__plot--drag"
        viewBox={`0 0 ${W} ${H}`}
        {...dragHandlers((p) => set(toY(p.y)))}
      >
        <svg x={0} y={0} width={W} height={H} overflow="hidden">
          <Line {...base} className="spec__ghost" />
          <Line {...all} className="spec__fit" />
        </svg>
        {COURIER.map((p) => (
          <circle
            key={p.x}
            className="spec__dot"
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={3.5}
          />
        ))}
        <line
          className="spec__residual"
          x1={sx(OUT_X)}
          x2={sx(OUT_X)}
          y1={sy(y)}
          y2={sy(all.w * OUT_X + all.b)}
        />
        <circle
          className="spec__handle"
          cx={sx(OUT_X)}
          cy={sy(y)}
          r={6}
          tabIndex={0}
          role="slider"
          aria-label="Height of the extra point"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={y}
          onKeyDown={sliderKeys(y, set, { min: 0, max: 100, step: 5 })}
        />
      </svg>
      <p className="spec__readout" aria-live="polite">
        Slope {all.w.toFixed(1)}, was {base.w.toFixed(1)} without it
      </p>
    </div>
  );
};
