import React, { useMemo, useState } from 'react';
import { Crosshair, RotateCcw, Sparkles } from 'lucide-react';

/*
 * Fit a line by hand. The reader moves w and b; the chart draws each residual
 * and, optionally, its square, so "mean squared error" is literally the mean
 * area of the squares. The least-squares line is computed in closed form from
 * whatever points are on the chart, including any the reader adds.
 *
 * Squares are drawn in pixel units of the y axis on both sides, so a square's
 * area is proportional to r² even though the x and y axes have different scales.
 */

interface Point {
  x: number;
  y: number;
}

/** The five deliveries used throughout the article (toy data). */
const COURIER: Point[] = [
  { x: 1, y: 20 },
  { x: 2, y: 40 },
  { x: 3, y: 50 },
  { x: 4, y: 40 },
  { x: 5, y: 50 },
];

const OUTLIER: Point = { x: 7, y: 10 };
const MAX_POINTS = 24;

const W = 640;
const H = 360;
const PAD = { top: 16, right: 16, bottom: 40, left: 48 };
const X_MAX = 8;
const Y_MAX = 100;
const kx = (W - PAD.left - PAD.right) / X_MAX;
const ky = (H - PAD.top - PAD.bottom) / Y_MAX;
const sx = (x: number) => PAD.left + x * kx;
const sy = (y: number) => H - PAD.bottom - y * ky;

function leastSquares(points: Point[]) {
  const n = points.length;
  const xm = points.reduce((s, p) => s + p.x, 0) / n;
  const ym = points.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of points) {
    sxy += (p.x - xm) * (p.y - ym);
    sxx += (p.x - xm) ** 2;
  }
  // All points share one x: no slope is identifiable; predict the mean.
  const w = sxx === 0 ? 0 : sxy / sxx;
  return { w, b: ym - w * xm };
}

const mse = (points: Point[], w: number, b: number) =>
  points.reduce((s, p) => s + (p.y - (w * p.x + b)) ** 2, 0) / points.length;

const round = (v: number, step: number) => Math.round(v / step) * step;

const LineFitter: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(COURIER);
  const [w, setW] = useState(2);
  const [b, setB] = useState(30);
  const [squares, setSquares] = useState(true);

  const best = useMemo(() => leastSquares(points), [points]);
  const current = mse(points, w, b);
  const optimal = mse(points, best.w, best.b);
  const hasOutlier = points.some((p) => p.x === OUTLIER.x && p.y === OUTLIER.y);

  const addPoint = (p: Point) => {
    if (points.length >= MAX_POINTS) return;
    setPoints([...points, p]);
  };

  const onChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    const dx = (x - PAD.left) / kx;
    const dy = (H - PAD.bottom - y) / ky;
    if (dx < 0 || dx > X_MAX || dy < 0 || dy > Y_MAX) return;
    addPoint({ x: round(dx, 0.1), y: round(dy, 1) });
  };

  const lineAt = (x: number, ww: number, bb: number) => sy(ww * x + bb);

  return (
    <figure
      className="lrx"
      aria-label="Interactive line fitting with squared residuals"
    >
      <div className="lrx__panel lrx__panel--top">
        <div className="lrx__sliders">
          <label className="lrx__slider">
            <span>
              slope <var>w</var>
              <output className="num">{w.toFixed(1)}</output>
              <small>min/km</small>
            </span>
            <input
              type="range"
              min={-10}
              max={20}
              step={0.1}
              value={w}
              onChange={(e) => setW(Number(e.target.value))}
            />
          </label>
          <label className="lrx__slider">
            <span>
              intercept <var>b</var>
              <output className="num">{b.toFixed(1)}</output>
              <small>min</small>
            </span>
            <input
              type="range"
              min={-20}
              max={70}
              step={0.5}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="lrx__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              setW(round(best.w, 0.1));
              setB(round(best.b, 0.5));
            }}
          >
            <Sparkles size={15} aria-hidden />
            Snap to least squares
          </button>
          <button
            type="button"
            className="button"
            disabled={hasOutlier || points.length >= MAX_POINTS}
            onClick={() => addPoint(OUTLIER)}
          >
            <Crosshair size={15} aria-hidden />
            Add outlier (7 km, 10 min)
          </button>
          <button
            type="button"
            className="button"
            onClick={() => setPoints(COURIER)}
            disabled={points.length === COURIER.length}
          >
            <RotateCcw size={15} aria-hidden />
            Reset points
          </button>
          <label className="lrx__check">
            <input
              type="checkbox"
              checked={squares}
              onChange={(e) => setSquares(e.target.checked)}
            />
            Draw squared errors
          </label>
        </div>
      </div>

      <div className="lrx__panel lrx__panel--body">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="lrx__chart lrx__chart--clickable"
          role="img"
          aria-label={`Scatter plot of ${points.length} deliveries with the line y = ${w.toFixed(1)}x + ${b.toFixed(1)}. Click to add a point.`}
          onClick={onChartClick}
        >
          <defs>
            <clipPath id="lrx-fit-clip">
              <rect
                x={PAD.left}
                y={PAD.top}
                width={W - PAD.left - PAD.right}
                height={H - PAD.top - PAD.bottom}
              />
            </clipPath>
          </defs>
          {/* grid and axes */}
          {Array.from({ length: Y_MAX / 20 + 1 }, (_, i) => i * 20).map((v) => (
            <g key={`y${v}`}>
              <line
                className="lrx__grid"
                x1={PAD.left}
                x2={W - PAD.right}
                y1={sy(v)}
                y2={sy(v)}
              />
              <text
                className="lrx__tick"
                x={PAD.left - 8}
                y={sy(v)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {v}
              </text>
            </g>
          ))}
          {Array.from({ length: X_MAX + 1 }, (_, i) => i).map((v) => (
            <text
              key={`x${v}`}
              className="lrx__tick"
              x={sx(v)}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
            >
              {v}
            </text>
          ))}
          <text
            className="lrx__axis-label"
            x={W - PAD.right}
            y={H - 4}
            textAnchor="end"
          >
            distance (km)
          </text>
          <text className="lrx__axis-label" x={PAD.left} y={PAD.top - 4}>
            minutes
          </text>

          <g clipPath="url(#lrx-fit-clip)">
            {/* least-squares line for reference */}
            <line
              className="lrx__best"
              x1={sx(0)}
              x2={sx(X_MAX)}
              y1={lineAt(0, best.w, best.b)}
              y2={lineAt(X_MAX, best.w, best.b)}
            />
            {/* residuals and their squares */}
            {points.map((p, i) => {
              const r = p.y - (w * p.x + b);
              const side = Math.abs(r) * ky;
              const top = Math.min(sy(p.y), lineAt(p.x, w, b));
              const leftward = sx(p.x) + side > W - PAD.right;
              return (
                <g key={i}>
                  {squares && side > 0.5 && (
                    <rect
                      className="lrx__square"
                      x={leftward ? sx(p.x) - side : sx(p.x)}
                      y={top}
                      width={side}
                      height={side}
                    />
                  )}
                  <line
                    className="lrx__residual"
                    x1={sx(p.x)}
                    x2={sx(p.x)}
                    y1={sy(p.y)}
                    y2={lineAt(p.x, w, b)}
                  />
                </g>
              );
            })}
            {/* reader's line */}
            <line
              className="lrx__line"
              x1={sx(0)}
              x2={sx(X_MAX)}
              y1={lineAt(0, w, b)}
              y2={lineAt(X_MAX, w, b)}
            />
          </g>
          {points.map((p, i) => (
            <circle
              key={i}
              className="lrx__point"
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={5}
            />
          ))}
        </svg>

        <dl className="lrx__readout" aria-live="polite">
          <div>
            <dt>Your line</dt>
            <dd className="num">
              ŷ = {w.toFixed(1)}x + {b.toFixed(1)}
            </dd>
          </div>
          <div>
            <dt>Your MSE</dt>
            <dd className="num">{current.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Least squares</dt>
            <dd className="num">
              ŷ = {best.w.toFixed(2)}x + {best.b.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt>Lowest possible MSE</dt>
            <dd className="num">{optimal.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Points</dt>
            <dd className="num">{points.length}</dd>
          </div>
        </dl>
      </div>
      <figcaption className="figure__caption">
        The solid line is yours; the dashed line is the least-squares fit for
        the points on the chart. Each square&rsquo;s area is its squared
        residual, so MSE is the average square area. Click the chart to add a
        point. Starts on the five toy deliveries from the worked example.
      </figcaption>
    </figure>
  );
};

export default LineFitter;
