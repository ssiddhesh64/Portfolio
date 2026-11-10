import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';

/*
 * Batch gradient descent on the article's five-point dataset, drawn on the
 * contours of the loss J(w, b) = (1/n) Σ (w·f_i + b − y_i)².
 *
 * Everything here is exact, not a cartoon:
 * - J is quadratic, so its level sets are ellipses: J = J* + dᵀ A d with
 *   A = (1/n) FᵀF and d = θ − θ*. They are drawn from A's eigendecomposition.
 * - The Hessian is H = 2A. Gradient descent with a fixed step α converges
 *   iff α < 2 / λmax(H); the limit shown is computed from the data.
 * - "Centred" replaces x with x − x̄. The predictions are the same family of
 *   lines, but the cross term in A vanishes and the condition number drops
 *   from about 70 to 2.
 */

const XS = [1, 2, 3, 4, 5];
const YS = [20, 40, 50, 40, 50];
const N = XS.length;
const X_MEAN = XS.reduce((s, v) => s + v, 0) / N;

type Mode = 'raw' | 'centred';
type Theta = { w: number; b: number };
type Status = 'idle' | 'running' | 'converged' | 'diverged' | 'max-steps';

const GRAD_TOL = 1e-3;
const BLOWUP = 1e7;
const MAX_STEPS = 3000;

interface Problem {
  f: number[];
  A: [number, number, number]; // [a_ww, a_wb, a_bb]
  opt: Theta;
  jOpt: number;
  eig: { l: number; v: [number, number] }[]; // eigenpairs of A, ascending
  limit: number; // 2 / λmax(H) = 1 / λmax(A)
}

function problem(mode: Mode): Problem {
  const f = XS.map((x) => (mode === 'raw' ? x : x - X_MEAN));
  const sff = f.reduce((s, v) => s + v * v, 0);
  const sf = f.reduce((s, v) => s + v, 0);
  const sfy = f.reduce((s, v, i) => s + v * YS[i], 0);
  const sy = YS.reduce((s, v) => s + v, 0);
  const A: [number, number, number] = [sff / N, sf / N, 1];
  // Normal equations: [sff sf; sf N] [w b]ᵀ = [sfy sy]ᵀ
  const det = sff * N - sf * sf;
  const opt = {
    w: (N * sfy - sf * sy) / det,
    b: (sff * sy - sf * sfy) / det,
  };
  const jOpt = loss(f, opt);
  const [a, c, d] = A;
  const mid = (a + d) / 2;
  const rad = Math.hypot((a - d) / 2, c);
  const eig = [mid - rad, mid + rad].map((l) => {
    const v: [number, number] =
      Math.abs(c) < 1e-12
        ? Math.abs(l - a) < 1e-9
          ? [1, 0]
          : [0, 1]
        : [c, l - a];
    const len = Math.hypot(v[0], v[1]);
    return { l, v: [v[0] / len, v[1] / len] as [number, number] };
  });
  return { f, A, opt, jOpt, eig, limit: 1 / eig[1].l };
}

function loss(f: number[], t: Theta) {
  return f.reduce((s, v, i) => s + (t.w * v + t.b - YS[i]) ** 2, 0) / N;
}

function gradient(f: number[], t: Theta): Theta {
  let gw = 0;
  let gb = 0;
  f.forEach((v, i) => {
    const r = t.w * v + t.b - YS[i];
    gw += r * v;
    gb += r;
  });
  return { w: (2 / N) * gw, b: (2 / N) * gb };
}

// Chart geometry: w across, b up, a fixed window around the optimum.
const W = 640;
const H = 400;
const PAD = { top: 16, right: 16, bottom: 40, left: 52 };
const HALF_W = 10;
const HALF_B = 32;
const LEVELS = [2, 8, 32, 128, 512, 2048];
const START_OFFSET: Theta = { w: -7, b: -24 };

// Learning-rate slider: log scale from 1e-3 to 1.
const toAlpha = (s: number) => 10 ** (-3 + (s / 1000) * 3);
const toSlider = (a: number) => ((Math.log10(a) + 3) / 3) * 1000;

const fmt = (v: number, digits = 3) =>
  Math.abs(v) >= 1e5 ? v.toExponential(2) : v.toFixed(digits);

const GradientDescentLab: React.FC = () => {
  const [mode, setMode] = useState<Mode>('raw');
  const p = useMemo(() => problem(mode), [mode]);
  const [alpha, setAlpha] = useState(() => 0.5 * problem('raw').limit);
  const [path, setPath] = useState<Theta[]>(() => {
    const o = problem('raw').opt;
    return [{ w: o.w + START_OFFSET.w, b: o.b + START_OFFSET.b }];
  });
  const [status, setStatus] = useState<Status>('idle');

  const view = {
    w0: p.opt.w - HALF_W,
    w1: p.opt.w + HALF_W,
    b0: p.opt.b - HALF_B,
    b1: p.opt.b + HALF_B,
  };
  const sx = (w: number) =>
    PAD.left +
    ((w - view.w0) / (view.w1 - view.w0)) * (W - PAD.left - PAD.right);
  const sy = (b: number) =>
    H -
    PAD.bottom -
    ((b - view.b0) / (view.b1 - view.b0)) * (H - PAD.top - PAD.bottom);

  const reset = (start?: Theta, nextMode: Mode = mode) => {
    const o = problem(nextMode).opt;
    setPath([start ?? { w: o.w + START_OFFSET.w, b: o.b + START_OFFSET.b }]);
    setStatus('idle');
  };

  const advance = (prev: Theta[]): { next: Theta[]; status: Status } => {
    const t = prev[prev.length - 1];
    const g = gradient(p.f, t);
    if (Math.hypot(g.w, g.b) < GRAD_TOL)
      return { next: prev, status: 'converged' };
    const t2 = { w: t.w - alpha * g.w, b: t.b - alpha * g.b };
    const next = [...prev, t2];
    if (!Number.isFinite(t2.w) || loss(p.f, t2) > BLOWUP)
      return { next, status: 'diverged' };
    if (next.length > MAX_STEPS) return { next, status: 'max-steps' };
    const g2 = gradient(p.f, t2);
    if (Math.hypot(g2.w, g2.b) < GRAD_TOL) return { next, status: 'converged' };
    return { next, status: 'running' };
  };

  const step = () => {
    if (
      status === 'converged' ||
      status === 'diverged' ||
      status === 'max-steps'
    )
      return;
    const r = advance(path);
    setPath(r.next);
    setStatus(r.status === 'running' ? 'idle' : r.status);
  };

  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => {
      setPath((prev) => {
        const r = advance(prev);
        if (r.status !== 'running') setStatus(r.status);
        return r.next;
      });
    }, 40);
    return () => window.clearInterval(id);
    // advance closes over alpha and the problem, both of which reset the run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, alpha, p]);

  const current = path[path.length - 1];
  const g = gradient(p.f, current);
  const j = loss(p.f, current);
  const done =
    status === 'converged' || status === 'diverged' || status === 'max-steps';

  const onChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    const w =
      view.w0 +
      ((x - PAD.left) / (W - PAD.left - PAD.right)) * (view.w1 - view.w0);
    const b =
      view.b0 +
      ((H - PAD.bottom - y) / (H - PAD.top - PAD.bottom)) * (view.b1 - view.b0);
    if (w < view.w0 || w > view.w1 || b < view.b0 || b > view.b1) return;
    reset({ w: Math.round(w * 10) / 10, b: Math.round(b * 10) / 10 });
  };

  const ellipse = (k: number) => {
    const [e1, e2] = p.eig;
    const r1 = Math.sqrt(k / e1.l);
    const r2 = Math.sqrt(k / e2.l);
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 2 * Math.PI;
      const c = r1 * Math.cos(t);
      const s = r2 * Math.sin(t);
      const w = p.opt.w + c * e1.v[0] + s * e2.v[0];
      const b = p.opt.b + c * e1.v[1] + s * e2.v[1];
      pts.push(`${sx(w).toFixed(1)},${sy(b).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Loss history, as log10(J − J*) so linear convergence is a straight line.
  const SPARK_H = 84;
  const gaps = path.map((t) => Math.max(loss(p.f, t) - p.jOpt, 1e-8));
  const logs = gaps.map((v) => Math.log10(v));
  const lo = -8;
  const hi = Math.max(4, ...logs.map((v) => Math.min(v, 8)));
  const spark = logs
    .map((v, i) => {
      const x =
        PAD.left +
        (i / Math.max(path.length - 1, 1)) * (W - PAD.left - PAD.right);
      const y = 8 + (1 - (Math.min(v, hi) - lo) / (hi - lo)) * (SPARK_H - 16);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const ratio = alpha / p.limit;
  let message: string;
  if (status === 'converged') {
    message = `Converged after ${path.length - 1} steps (‖∇J‖ < ${GRAD_TOL}). The minimum is w = ${p.opt.w.toFixed(2)}, b = ${p.opt.b.toFixed(2)}, J = ${p.jOpt.toFixed(2)}.`;
  } else if (status === 'diverged') {
    message = `Diverged after ${path.length - 1} steps. α = ${fmt(alpha, 4)} is above the stability limit ${fmt(p.limit, 4)}, so every step along the steepest direction lands farther from the minimum than it started.`;
  } else if (status === 'max-steps') {
    message = `Stopped at ${MAX_STEPS} steps without converging. Along the flat direction each step shrinks the error by only a factor of ${(1 - 2 * alpha * p.eig[0].l).toFixed(4)}.`;
  } else if (ratio >= 1) {
    message = `α is ${ratio.toFixed(2)}× the stability limit. Run it: the error along the steep direction grows every step.`;
  } else if (ratio > 0.5) {
    message = `α is above half the limit, so along the steep direction each step overshoots the valley floor and lands on the other side: the zig-zag.`;
  } else {
    message = `α is ${ratio.toFixed(2)}× the stability limit: no overshoot along either direction, but the flat direction is slow.`;
  }

  const setPreset = (fraction: number) => {
    setAlpha(fraction * p.limit);
    reset();
  };

  return (
    <figure
      className="lrx"
      aria-label="Interactive gradient descent on the loss contours"
    >
      <div className="lrx__panel lrx__panel--top">
        <div className="lrx__row">
          <span className="lrx__label" id="gd-mode">
            Feature
          </span>
          <div
            className="lrx__segmented"
            role="group"
            aria-labelledby="gd-mode"
          >
            {(['raw', 'centred'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  if (m === mode) return;
                  const q = problem(m);
                  setMode(m);
                  setAlpha(ratio * q.limit);
                  reset(undefined, m);
                }}
              >
                {m === 'raw' ? 'x (raw)' : 'x − mean (centred)'}
              </button>
            ))}
          </div>
        </div>
        <label className="lrx__slider">
          <span>
            learning rate <var>α</var>
            <output className="num">{fmt(alpha, 4)}</output>
            <small>stable below {fmt(p.limit, 4)}</small>
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={toSlider(alpha)}
            onChange={(e) => {
              setAlpha(toAlpha(Number(e.target.value)));
              reset(path[0]);
            }}
          />
        </label>
        <div className="lrx__row">
          <span className="lrx__label">Presets</span>
          <div
            className="lrx__segmented"
            role="group"
            aria-label="Learning-rate presets"
          >
            {[
              { f: 0.25, label: '0.25 × limit' },
              { f: 0.5, label: '0.5 × limit' },
              { f: 0.9, label: '0.9 × limit' },
              { f: 1.05, label: '1.05 × limit' },
            ].map(({ f, label }) => (
              <button
                key={f}
                type="button"
                aria-pressed={Math.abs(ratio - f) < 1e-6}
                onClick={() => setPreset(f)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="lrx__actions">
          <button
            type="button"
            className="button button--primary"
            disabled={done}
            onClick={() => setStatus(status === 'running' ? 'idle' : 'running')}
          >
            {status === 'running' ? (
              <Pause size={15} aria-hidden />
            ) : (
              <Play size={15} aria-hidden />
            )}
            {status === 'running' ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            className="button"
            disabled={done || status === 'running'}
            onClick={step}
          >
            <StepForward size={15} aria-hidden />
            Step
          </button>
          <button
            type="button"
            className="button"
            onClick={() => reset(path[0])}
          >
            <RotateCcw size={15} aria-hidden />
            Reset
          </button>
        </div>
      </div>

      <div className="lrx__panel lrx__panel--body">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="lrx__chart lrx__chart--clickable"
          role="img"
          aria-label={`Contours of the loss over w and b. Gradient descent is at w = ${current.w.toFixed(2)}, b = ${current.b.toFixed(2)} after ${path.length - 1} steps. Click to choose a new starting point.`}
          onClick={onChartClick}
        >
          <defs>
            <clipPath id="gd-clip">
              <rect
                x={PAD.left}
                y={PAD.top}
                width={W - PAD.left - PAD.right}
                height={H - PAD.top - PAD.bottom}
              />
            </clipPath>
          </defs>
          <rect
            className="lrx__plot-bg"
            x={PAD.left}
            y={PAD.top}
            width={W - PAD.left - PAD.right}
            height={H - PAD.top - PAD.bottom}
          />
          {[-8, -4, 0, 4, 8].map((d) => (
            <text
              key={`w${d}`}
              className="lrx__tick"
              x={sx(p.opt.w + d)}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
            >
              {p.opt.w + d}
            </text>
          ))}
          {[-24, -12, 0, 12, 24].map((d) => (
            <text
              key={`b${d}`}
              className="lrx__tick"
              x={PAD.left - 8}
              y={sy(p.opt.b + d)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(p.opt.b + d)}
            </text>
          ))}
          <text
            className="lrx__axis-label"
            x={W - PAD.right}
            y={H - 4}
            textAnchor="end"
          >
            slope w
          </text>
          <text className="lrx__axis-label" x={PAD.left} y={PAD.top - 4}>
            intercept b
          </text>
          <g clipPath="url(#gd-clip)">
            {LEVELS.map((k) => (
              <polygon key={k} className="lrx__contour" points={ellipse(k)} />
            ))}
            <polyline
              className="lrx__path"
              points={path
                .map((t) => `${sx(t.w).toFixed(1)},${sy(t.b).toFixed(1)}`)
                .join(' ')}
            />
            {path.length < 300 &&
              path
                .slice(0, -1)
                .map((t, i) => (
                  <circle
                    key={i}
                    className="lrx__path-dot"
                    cx={sx(t.w)}
                    cy={sy(t.b)}
                    r={2.5}
                  />
                ))}
            <path
              className="lrx__optimum"
              d={`M${sx(p.opt.w) - 6},${sy(p.opt.b)}h12M${sx(p.opt.w)},${sy(p.opt.b) - 6}v12`}
            />
            <circle
              className="lrx__current"
              cx={sx(current.w)}
              cy={sy(current.b)}
              r={6}
            />
          </g>
        </svg>

        <dl className="lrx__readout">
          <div>
            <dt>Step</dt>
            <dd className="num">{path.length - 1}</dd>
          </div>
          <div>
            <dt>
              <var>w</var>, <var>b</var>
            </dt>
            <dd className="num">
              {fmt(current.w, 3)}, {fmt(current.b, 3)}
            </dd>
          </div>
          <div>
            <dt>
              Loss <var>J</var>
            </dt>
            <dd className="num">{fmt(j, 3)}</dd>
          </div>
          <div>
            <dt>∂J/∂w, ∂J/∂b</dt>
            <dd className="num">
              {fmt(g.w, 3)}, {fmt(g.b, 3)}
            </dd>
          </div>
          <div>
            <dt>Hessian eigenvalues</dt>
            <dd className="num">
              {(2 * p.eig[0].l).toFixed(3)}, {(2 * p.eig[1].l).toFixed(3)}
            </dd>
          </div>
          <div>
            <dt>Condition number</dt>
            <dd className="num">{(p.eig[1].l / p.eig[0].l).toFixed(1)}</dd>
          </div>
        </dl>

        <div className="lrx__spark">
          <span className="lrx__label">
            <var>J</var> − <var>J</var>* per step, log scale
          </span>
          <svg
            viewBox={`0 0 ${W} ${SPARK_H}`}
            className="lrx__chart"
            aria-hidden
          >
            <line
              className="lrx__grid"
              x1={PAD.left}
              x2={W - PAD.right}
              y1={SPARK_H - 8}
              y2={SPARK_H - 8}
            />
            <text
              className="lrx__tick"
              x={PAD.left - 8}
              y={8}
              textAnchor="end"
              dominantBaseline="middle"
            >
              1e{Math.round(hi)}
            </text>
            <text
              className="lrx__tick"
              x={PAD.left - 8}
              y={SPARK_H - 8}
              textAnchor="end"
              dominantBaseline="middle"
            >
              1e−8
            </text>
            {path.length > 1 && (
              <polyline className="lrx__spark-line" points={spark} />
            )}
          </svg>
        </div>

        <p className="lrx__status" aria-live="polite" data-status={status}>
          {message}
        </p>
      </div>
      <figcaption className="figure__caption">
        Each ellipse is a set of (w, b) with the same loss on the five toy
        deliveries; the cross marks the minimum. Click the chart to start from
        somewhere else. Switching to the centred feature changes the coordinates
        (b becomes the prediction at the mean distance), not the set of lines
        the model can draw.
      </figcaption>
    </figure>
  );
};

export default GradientDescentLab;
