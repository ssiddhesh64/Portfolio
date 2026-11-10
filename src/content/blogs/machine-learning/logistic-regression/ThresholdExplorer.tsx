import React, { useMemo, useState } from 'react';
import { TEST_SCORES } from './testScores';

/*
 * Move the decision threshold over real model output: the predicted
 * P(malignant) for the 114 held-out patients in the article's breast cancer
 * experiment. Nothing is simulated; the confusion matrix, metrics and ROC
 * curve are recomputed from those 114 (probability, label) pairs.
 */

const PRESETS = [0.9, 0.5, 0.3, 0.1, 0.05];

// Strip plot geometry.
const W = 640;
const H = 190;
const PAD = { top: 12, right: 16, bottom: 34, left: 92 };
const ROW_H = (H - PAD.top - PAD.bottom) / 2;
const px = (p: number) => PAD.left + p * (W - PAD.left - PAD.right);

// ROC geometry.
const R = 240;
const RP = { top: 10, right: 10, bottom: 36, left: 50 };
const rx = (v: number) => RP.left + v * (R - RP.left - RP.right);
const ry = (v: number) => R - RP.bottom - v * (R - RP.top - RP.bottom);

/** Deterministic jitter in [0, 1) so the plot is identical on every render. */
const jitter = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

function counts(threshold: number) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const [p, y] of TEST_SCORES) {
    const pred = p >= threshold;
    if (pred && y === 1) tp += 1;
    else if (pred && y === 0) fp += 1;
    else if (!pred && y === 1) fn += 1;
    else tn += 1;
  }
  return { tp, fp, fn, tn };
}

const pct = (num: number, den: number) =>
  den === 0 ? '—' : `${((100 * num) / den).toFixed(1)}%`;

const ThresholdExplorer: React.FC = () => {
  const [threshold, setThreshold] = useState(0.5);
  const { tp, fp, fn, tn } = counts(threshold);
  const pos = tp + fn;
  const neg = fp + tn;
  const precision = tp + fp === 0 ? NaN : tp / (tp + fp);
  const recall = tp / pos;
  const f1 =
    Number.isNaN(precision) || precision + recall === 0
      ? NaN
      : (2 * precision * recall) / (precision + recall);

  // ROC: sweep the threshold through every distinct score, high to low.
  const roc = useMemo(() => {
    const thresholds = [
      Infinity,
      ...Array.from(new Set(TEST_SCORES.map(([p]) => p))).sort((a, b) => b - a),
    ];
    return thresholds.map((t) => {
      const c = counts(t);
      return { fpr: c.fp / (c.fp + c.tn), tpr: c.tp / (c.tp + c.fn) };
    });
  }, []);
  const rocPath = roc
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'}${rx(pt.fpr).toFixed(1)},${ry(pt.tpr).toFixed(1)}`,
    )
    .join('');

  return (
    <figure
      className="lrx"
      aria-label="Interactive decision threshold on real test-set predictions"
    >
      <div className="lrx__panel lrx__panel--top">
        <label className="lrx__slider">
          <span>
            threshold <var>t</var>
            <output className="num">{threshold.toFixed(2)}</output>
            <small>predict malignant when P(malignant) ≥ t</small>
          </span>
          <input
            type="range"
            min={0.01}
            max={0.99}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </label>
        <div className="lrx__row">
          <span className="lrx__label">Presets</span>
          <div className="lrx__segmented">
            {PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={threshold === t}
                onClick={() => setThreshold(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lrx__panel lrx__panel--body">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="lrx__chart"
          role="img"
          aria-label={`Predicted probabilities for ${neg} benign and ${pos} malignant test patients, with the threshold at ${threshold.toFixed(2)}.`}
        >
          <rect
            className="lrx__region"
            x={px(threshold)}
            y={PAD.top}
            width={px(1) - px(threshold)}
            height={2 * ROW_H}
          />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line
                className="lrx__grid"
                x1={px(v)}
                x2={px(v)}
                y1={PAD.top}
                y2={PAD.top + 2 * ROW_H}
              />
              <text
                className="lrx__tick"
                x={px(v)}
                y={H - PAD.bottom + 18}
                textAnchor="middle"
              >
                {v}
              </text>
            </g>
          ))}
          <text
            className="lrx__axis-label"
            x={W - PAD.right}
            y={H - 2}
            textAnchor="end"
          >
            predicted P(malignant)
          </text>
          {['benign', 'malignant'].map((label, row) => (
            <text
              key={label}
              className="lrx__tick"
              x={PAD.left - 10}
              y={PAD.top + ROW_H * (row + 0.5)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}
          {TEST_SCORES.map(([p, y], i) => {
            const wrong = p >= threshold !== (y === 1);
            const cy = PAD.top + ROW_H * y + ROW_H * (0.15 + 0.7 * jitter(i));
            return (
              <circle
                key={i}
                className={[
                  'lrx__point',
                  y === 0 ? 'lrx__point--hollow' : '',
                  wrong ? 'lrx__point--wrong' : '',
                ].join(' ')}
                cx={px(p)}
                cy={cy}
                r={wrong ? 6 : 4}
              />
            );
          })}
          <line
            className="lrx__boundary lrx__boundary--strong"
            x1={px(threshold)}
            x2={px(threshold)}
            y1={PAD.top - 4}
            y2={PAD.top + 2 * ROW_H + 4}
          />
        </svg>

        <div className="lrx__split">
          <table className="lrx__matrix">
            <caption>Confusion matrix, 114 test patients</caption>
            <thead>
              <tr>
                <td />
                <th scope="col">Predicted malignant</th>
                <th scope="col">Predicted benign</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Malignant ({pos})</th>
                <td className="num">
                  <strong>{tp}</strong>
                  <small>true positive</small>
                </td>
                <td className="num" data-error={fn > 0}>
                  <strong>{fn}</strong>
                  <small>false negative: missed cancer</small>
                </td>
              </tr>
              <tr>
                <th scope="row">Benign ({neg})</th>
                <td className="num" data-error={fp > 0}>
                  <strong>{fp}</strong>
                  <small>false positive: needless follow-up</small>
                </td>
                <td className="num">
                  <strong>{tn}</strong>
                  <small>true negative</small>
                </td>
              </tr>
            </tbody>
          </table>

          <svg
            viewBox={`0 0 ${R} ${R}`}
            className="lrx__chart lrx__roc"
            role="img"
            aria-label={`ROC curve with the current threshold at false positive rate ${pct(fp, neg)} and true positive rate ${pct(tp, pos)}.`}
          >
            {[0, 0.5, 1].map((v) => (
              <g key={v}>
                <line
                  className="lrx__grid"
                  x1={rx(0)}
                  x2={rx(1)}
                  y1={ry(v)}
                  y2={ry(v)}
                />
                <line
                  className="lrx__grid"
                  x1={rx(v)}
                  x2={rx(v)}
                  y1={ry(0)}
                  y2={ry(1)}
                />
                <text
                  className="lrx__tick"
                  x={rx(0) - 6}
                  y={ry(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {v}
                </text>
                <text
                  className="lrx__tick"
                  x={rx(v)}
                  y={ry(0) + 16}
                  textAnchor="middle"
                >
                  {v}
                </text>
              </g>
            ))}
            <line
              className="lrx__best"
              x1={rx(0)}
              y1={ry(0)}
              x2={rx(1)}
              y2={ry(1)}
            />
            <path className="lrx__spark-line" d={rocPath} />
            <circle
              className="lrx__current"
              cx={rx(fp / neg)}
              cy={ry(tp / pos)}
              r={6}
            />
            <text
              className="lrx__axis-label"
              x={rx(1)}
              y={R - 4}
              textAnchor="end"
            >
              false positive rate
            </text>
            <text
              className="lrx__axis-label"
              transform={`translate(12 ${ry(0.5)}) rotate(-90)`}
              textAnchor="middle"
            >
              true positive rate
            </text>
          </svg>
        </div>

        <dl className="lrx__readout" aria-live="polite">
          <div>
            <dt>Accuracy</dt>
            <dd className="num">{pct(tp + tn, pos + neg)}</dd>
          </div>
          <div>
            <dt>Recall (sensitivity)</dt>
            <dd className="num">{pct(tp, pos)}</dd>
          </div>
          <div>
            <dt>Precision</dt>
            <dd className="num">{pct(tp, tp + fp)}</dd>
          </div>
          <div>
            <dt>Specificity</dt>
            <dd className="num">{pct(tn, neg)}</dd>
          </div>
          <div>
            <dt>F1</dt>
            <dd className="num">{Number.isNaN(f1) ? '—' : f1.toFixed(3)}</dd>
          </div>
        </dl>
      </div>
      <figcaption className="figure__caption">
        Each dot is one held-out patient, placed at the probability the model
        gave it. Patients right of the threshold are predicted malignant;
        enlarged dots are misclassified at the current threshold. The ROC curve
        traces every threshold at once, and the dot marks yours. The dashed
        diagonal is a model that guesses.
      </figcaption>
    </figure>
  );
};

export default ThresholdExplorer;
