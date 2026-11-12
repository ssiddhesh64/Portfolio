import React, { useState } from 'react';
import { clamp, dragHandlers, sliderKeys } from './drag';

/*
 * The article's eight deliveries (overlapping classes), the sigmoid fitted to
 * them by Newton's method, and a threshold the reader drags. Points the
 * threshold classifies wrongly are drawn hollow in the accent colour.
 */

const XS = [1, 2, 3, 4, 5, 6, 7, 8];
const YS = [0, 0, 0, 1, 0, 1, 1, 1];
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Maximum-likelihood fit by Newton's method; this data has a finite optimum. */
function newton() {
  let w = 0;
  let b = 0;
  for (let i = 0; i < 25; i++) {
    let gw = 0;
    let gb = 0;
    let hww = 0;
    let hwb = 0;
    let hbb = 0;
    XS.forEach((x, k) => {
      const p = sigmoid(w * x + b);
      const r = p - YS[k];
      const s = p * (1 - p);
      gw += r * x;
      gb += r;
      hww += s * x * x;
      hwb += s * x;
      hbb += s;
    });
    const det = hww * hbb - hwb * hwb;
    w -= (hbb * gw - hwb * gb) / det;
    b -= (hww * gb - hwb * gw) / det;
  }
  return { w, b };
}

const { w, b } = newton();

const W = 240;
const H = 132;
const PX = 10;
const PY = 14;
const sx = (x: number) => PX + (x / 9) * (W - 2 * PX);
const sy = (p: number) => H - PY - p * (H - 2 * PY);
const toP = (py: number) => (H - PY - py) / (H - 2 * PY);

const curve = Array.from({ length: 61 }, (_, i) => {
  const x = (i / 60) * 9;
  return `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(sigmoid(w * x + b)).toFixed(1)}`;
}).join('');

export const ThresholdSlide: React.FC = () => {
  const [t, setT] = useState(0.5);
  const set = (v: number) => setT(Math.round(clamp(v, 0.05, 0.95) * 20) / 20);
  const right = XS.filter(
    (x, k) => (sigmoid(w * x + b) >= t ? 1 : 0) === YS[k],
  ).length;

  return (
    <div className="spec">
      <svg
        className="spec__plot spec__plot--drag"
        viewBox={`0 0 ${W} ${H}`}
        {...dragHandlers((p) => set(toP(p.y)))}
      >
        <line
          className="spec__axis"
          x1={PX}
          x2={W - PX}
          y1={sy(0)}
          y2={sy(0)}
        />
        <line
          className="spec__axis"
          x1={PX}
          x2={W - PX}
          y1={sy(1)}
          y2={sy(1)}
        />
        <path className="spec__fit" d={curve} fill="none" />
        {XS.map((x, k) => {
          const wrong = (sigmoid(w * x + b) >= t ? 1 : 0) !== YS[k];
          return (
            <circle
              key={x}
              className={wrong ? 'spec__dot spec__dot--wrong' : 'spec__dot'}
              cx={sx(x)}
              cy={sy(YS[k])}
              r={3.5}
            />
          );
        })}
        <line
          className="spec__threshold"
          x1={PX}
          x2={W - PX}
          y1={sy(t)}
          y2={sy(t)}
        />
        <rect
          className="spec__handle"
          x={W - PX - 14}
          y={sy(t) - 6}
          width={14}
          height={12}
          rx={3}
          tabIndex={0}
          role="slider"
          aria-label="Decision threshold"
          aria-valuemin={0.05}
          aria-valuemax={0.95}
          aria-valuenow={t}
          aria-valuetext={`${Math.round(t * 100)}%`}
          onKeyDown={sliderKeys(t, set, { min: 0.05, max: 0.95, step: 0.05 })}
        />
      </svg>
      <p className="spec__readout" aria-live="polite">
        Yes above {Math.round(t * 100)}%: {right} of 8 right
      </p>
    </div>
  );
};
