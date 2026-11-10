import React, { useState } from 'react';
import { FastForward, RotateCcw, Sparkles, StepForward } from 'lucide-react';

/*
 * Fit a sigmoid by hand, by gradient descent, or by Newton's method, on the
 * eight toy deliveries from the article. Every number is computed live from
 * the same formulas the article derives:
 *
 *   p_i  = σ(w x_i + b)
 *   J    = mean(−y log p − (1 − y) log(1 − p)) + (λ/2) w²
 *   ∇J   = [mean((p − y) x) + λ w,  mean(p − y)]
 *
 * Gradient steps use α = 0.1, the same as the article's gradient_descent().
 * On the separable dataset with λ = 0 the loss has no minimum: the reader
 * can watch w grow without bound.
 */

type DatasetKey = 'overlap' | 'separable';

const XS = [1, 2, 3, 4, 5, 6, 7, 8];
const DATASETS: Record<DatasetKey, number[]> = {
  overlap: [0, 0, 0, 1, 0, 1, 1, 1],
  separable: [0, 0, 0, 0, 1, 1, 1, 1],
};
const LAMBDAS = [0, 0.01, 0.1];
const LR = 0.1;
const NEWTON_MAX = 25;

const W = 640;
const H = 320;
const PAD = { top: 20, right: 16, bottom: 40, left: 48 };
const X_MAX = 10;
const Y_MIN = -0.08;
const Y_MAX = 1.08;
const sx = (x: number) => PAD.left + (x / X_MAX) * (W - PAD.left - PAD.right);
const sy = (y: number) =>
  H - PAD.bottom - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom);

const sigmoid = (z: number) =>
  z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
/** log(1 + e^z) without overflow. */
const softplus = (z: number) =>
  Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));

interface Stats {
  loss: number;
  gw: number;
  gb: number;
  hww: number;
  hwb: number;
  hbb: number;
  correct: number;
}

function stats(ys: number[], w: number, b: number, lambda: number): Stats {
  const n = XS.length;
  let loss = 0;
  let gw = 0;
  let gb = 0;
  let hww = 0;
  let hwb = 0;
  let hbb = 0;
  let correct = 0;
  XS.forEach((x, i) => {
    const z = w * x + b;
    const p = sigmoid(z);
    const y = ys[i];
    // −log p = softplus(−z); −log(1 − p) = softplus(z)
    loss += y === 1 ? softplus(-z) : softplus(z);
    gw += (p - y) * x;
    gb += p - y;
    const s = p * (1 - p);
    hww += s * x * x;
    hwb += s * x;
    hbb += s;
    if ((p >= 0.5 ? 1 : 0) === y) correct += 1;
  });
  return {
    loss: loss / n + (lambda / 2) * w * w,
    gw: gw / n + lambda * w,
    gb: gb / n,
    hww: hww / n + lambda,
    hwb: hwb / n,
    hbb: hbb / n,
    correct,
  };
}

const fmt = (v: number, digits = 3) =>
  Math.abs(v) >= 1000 ? v.toExponential(2) : v.toFixed(digits);

const SigmoidFitter: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetKey>('overlap');
  const [lambda, setLambda] = useState(0);
  const [w, setW] = useState(0);
  const [b, setB] = useState(0);
  const [steps, setSteps] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const ys = DATASETS[dataset];
  const s = stats(ys, w, b, lambda);
  const gradNorm = Math.hypot(s.gw, s.gb);
  const boundary = w !== 0 ? -b / w : NaN;
  // Separable data without a penalty: the maximum-likelihood estimate does not exist.
  const noOptimum = dataset === 'separable' && lambda === 0;

  const reset = (next?: Partial<{ dataset: DatasetKey; lambda: number }>) => {
    if (next?.dataset) setDataset(next.dataset);
    if (next?.lambda !== undefined) setLambda(next.lambda);
    setW(0);
    setB(0);
    setSteps(0);
    setNote(null);
  };

  const gradientSteps = (count: number) => {
    let ww = w;
    let bb = b;
    for (let k = 0; k < count; k += 1) {
      const g = stats(ys, ww, bb, lambda);
      ww -= LR * g.gw;
      bb -= LR * g.gb;
    }
    setW(ww);
    setB(bb);
    setSteps(steps + count);
    setNote(null);
  };

  const newton = () => {
    let ww = w;
    let bb = b;
    let it = 0;
    for (; it < NEWTON_MAX; it += 1) {
      const g = stats(ys, ww, bb, lambda);
      const det = g.hww * g.hbb - g.hwb * g.hwb;
      if (!(det > 1e-14)) break; // curvature has vanished: no finite optimum
      const dw = (g.hbb * g.gw - g.hwb * g.gb) / det;
      const db = (g.hww * g.gb - g.hwb * g.gw) / det;
      ww -= dw;
      bb -= db;
      if (Math.hypot(dw, db) < 1e-10) {
        it += 1;
        break;
      }
    }
    setW(ww);
    setB(bb);
    setSteps(0);
    const after = stats(ys, ww, bb, lambda);
    let message: string;
    if (noOptimum) {
      // The gradient underflows once every p is within ~1e-16 of its label,
      // which looks like convergence but is not: the loss has no minimum.
      message = `Newton's method ran ${it} iterations and pushed w to ${fmt(ww, 1)}. In floating point the gradient has underflowed to zero.`;
    } else if (Math.hypot(after.gw, after.gb) < 1e-6) {
      message = `Newton's method converged in ${it} iterations.`;
    } else {
      message = `Newton's method stopped after ${it} iterations without converging.`;
    }
    setNote(message);
  };

  let status: { kind: 'converged' | 'diverged' | 'idle'; text: string };
  if (noOptimum && s.correct === 8) {
    status = {
      kind: 'diverged',
      text: 'Every point is on the correct side, and a steeper curve always lowers the loss further, so no finite w minimises it. Try a penalty.',
    };
  } else if (gradNorm < 1e-4) {
    status = {
      kind: 'converged',
      text:
        lambda > 0
          ? 'The gradient is zero: this is the penalised maximum-likelihood fit.'
          : 'The gradient is zero: this is the maximum-likelihood fit.',
    };
  } else {
    status = {
      kind: 'idle',
      text: 'Not at the optimum yet. The gradient points uphill; each step moves against it.',
    };
  }

  const curve = Array.from({ length: 201 }, (_, i) => {
    const x = (i / 200) * X_MAX;
    return `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(sigmoid(w * x + b)).toFixed(1)}`;
  }).join('');

  return (
    <figure
      className="lrx"
      aria-label="Interactive logistic regression fit on eight deliveries"
    >
      <div className="lrx__panel lrx__panel--top">
        <div className="lrx__sliders">
          <label className="lrx__slider">
            <span>
              weight <var>w</var>
              <output className="num">{fmt(w)}</output>
              <small>log-odds per km</small>
            </span>
            <input
              type="range"
              min={-1}
              max={8}
              step={0.01}
              value={Math.min(8, Math.max(-1, w))}
              onChange={(e) => {
                setW(Number(e.target.value));
                setNote(null);
              }}
            />
          </label>
          <label className="lrx__slider">
            <span>
              bias <var>b</var>
              <output className="num">{fmt(b)}</output>
              <small>log-odds at 0 km</small>
            </span>
            <input
              type="range"
              min={-40}
              max={5}
              step={0.05}
              value={Math.min(5, Math.max(-40, b))}
              onChange={(e) => {
                setB(Number(e.target.value));
                setNote(null);
              }}
            />
          </label>
        </div>
        <div className="lrx__row">
          <span className="lrx__label">Data</span>
          <div className="lrx__segmented">
            {(
              [
                ['overlap', 'Overlapping'],
                ['separable', 'Separable'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={dataset === key}
                onClick={() => reset({ dataset: key })}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="lrx__label">
            L2 penalty <var>λ</var>
          </span>
          <div className="lrx__segmented">
            {LAMBDAS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lambda === l}
                onClick={() => {
                  setLambda(l);
                  setNote(null);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="lrx__actions">
          <button
            type="button"
            className="button"
            onClick={() => gradientSteps(1)}
          >
            <StepForward size={15} aria-hidden />
            Gradient step
          </button>
          <button
            type="button"
            className="button"
            onClick={() => gradientSteps(100)}
          >
            <FastForward size={15} aria-hidden />
            100 steps
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={newton}
          >
            <Sparkles size={15} aria-hidden />
            Fit with Newton&rsquo;s method
          </button>
          <button type="button" className="button" onClick={() => reset()}>
            <RotateCcw size={15} aria-hidden />
            Reset to w = b = 0
          </button>
        </div>
      </div>

      <div className="lrx__panel lrx__panel--body">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="lrx__chart"
          role="img"
          aria-label={`Eight deliveries plotted at probability 0 (on time) or 1 (late), with the curve p = sigmoid(${fmt(w, 2)} x + ${fmt(b, 2)}).`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line
                className={v === 0.5 ? 'lrx__threshold' : 'lrx__grid'}
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
              key={v}
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
          <text className="lrx__axis-label" x={PAD.left} y={PAD.top - 6}>
            P(late)
          </text>

          {Number.isFinite(boundary) && boundary > 0 && boundary < X_MAX && (
            <line
              className="lrx__boundary"
              x1={sx(boundary)}
              x2={sx(boundary)}
              y1={sy(Y_MIN)}
              y2={sy(Y_MAX)}
            />
          )}
          {/* the gap between each label and the curve: what log loss punishes */}
          {XS.map((x, i) => (
            <line
              key={`gap${x}`}
              className="lrx__residual"
              x1={sx(x)}
              x2={sx(x)}
              y1={sy(ys[i])}
              y2={sy(sigmoid(w * x + b))}
            />
          ))}
          <path className="lrx__line lrx__curve" d={curve} />
          {XS.map((x, i) => (
            <circle
              key={`pt${x}`}
              className={
                ys[i] === 1 ? 'lrx__point' : 'lrx__point lrx__point--hollow'
              }
              cx={sx(x)}
              cy={sy(ys[i])}
              r={5.5}
            />
          ))}
        </svg>

        <dl className="lrx__readout" aria-live="polite">
          <div>
            <dt>Mean log loss J</dt>
            <dd className="num">{fmt(s.loss, 4)}</dd>
          </div>
          <div>
            <dt>Gradient ∂J/∂w, ∂J/∂b</dt>
            <dd className="num">
              {fmt(s.gw, 4)}, {fmt(s.gb, 4)}
            </dd>
          </div>
          <div>
            <dt>Boundary −b/w</dt>
            <dd className="num">
              {Number.isFinite(boundary) ? `${fmt(boundary, 2)} km` : '—'}
            </dd>
          </div>
          <div>
            <dt>Correct at 0.5</dt>
            <dd className="num">{s.correct} / 8</dd>
          </div>
          <div>
            <dt>Gradient steps</dt>
            <dd className="num">{steps}</dd>
          </div>
        </dl>
        <p className="lrx__status" data-status={status.kind}>
          {note ? `${note} ` : ''}
          {status.text}
        </p>
      </div>
      <figcaption className="figure__caption">
        Hollow points are on-time deliveries (y = 0), filled points are late (y
        = 1). The curve is the model&rsquo;s P(late); each vertical segment is
        the probability it failed to give the true label, and the dotted line
        marks the decision boundary where the curve crosses 0.5. Gradient steps
        use a learning rate of 0.1. Toy data from the worked example.
      </figcaption>
    </figure>
  );
};

export default SigmoidFitter;
