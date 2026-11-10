import React, { useMemo, useState } from 'react';
import { RotateCcw, StepForward } from 'lucide-react';

/*
 * A 16-bucket model of java.util.HashMap as used by HashSet<Employee>, where
 * Employee.hashCode() returns its id and equals() compares ids.
 *
 * What it models faithfully:
 * - hash(key) = h ^ (h >>> 16), bucket = (n - 1) & hash
 * - every node caches the hash it was inserted with (HashMap.Node.hash)
 * - lookups match on `node.hash == hash && (node.key == key || key.equals(node.key))`
 * - iteration walks the table and Iterator.remove() uses the cached hash
 * What it leaves out: resizing and treeification (the table never grows here).
 */

const N = 16;

interface Obj {
  ref: string;
  id: number;
}

interface TableNode {
  /** The hash cached when the node was inserted. */
  hash: number;
  ref: string;
}

type Op =
  | { kind: 'new'; ref: string; id: number }
  | { kind: 'add'; ref: string }
  | { kind: 'contains'; ref: string }
  | { kind: 'remove'; ref: string }
  | { kind: 'mutate'; ref: string; id: number }
  | { kind: 'size' }
  | { kind: 'removeIf'; ref: string }
  | { kind: 'rebuild' };

type Tone = 'ok' | 'bad' | 'neutral';

interface Trace {
  code: string;
  steps: string[];
  result?: string;
  tone: Tone;
  /** Bucket the operation looked in. */
  bucket?: number;
}

interface State {
  objects: Obj[];
  table: TableNode[][];
  trace: Trace | null;
}

const emptyTable = (): TableNode[][] => Array.from({ length: N }, () => []);
const initialState = (): State => ({
  objects: [],
  table: emptyTable(),
  trace: null,
});

const spread = (h: number) => (h ^ (h >>> 16)) | 0;
const bucketOf = (hash: number) => (N - 1) & hash;
const bits = (b: number) => b.toString(2).padStart(4, '0');

function hashSteps(ref: string, id: number): { hash: number; steps: string[] } {
  const hash = spread(id);
  const b = bucketOf(hash);
  return {
    hash,
    steps: [
      `${ref}.hashCode() returns ${id}`,
      `spread: ${id} ^ (${id} >>> 16) = ${hash}`,
      `bucket: 15 & ${hash} = 0b${bits(b)} = ${b}`,
    ],
  };
}

/** HashMap.getNode: walk one bucket, comparing cached hash first, then equals. */
function find(
  state: State,
  ref: string,
  steps: string[],
): { bucket: number; index: number } {
  const me = state.objects.find((o) => o.ref === ref)!;
  const { hash, steps: hs } = hashSteps(ref, me.id);
  steps.push(...hs);
  const bucket = bucketOf(hash);
  const chain = state.table[bucket];
  if (chain.length === 0) {
    steps.push(`bucket ${bucket} is empty`);
    return { bucket, index: -1 };
  }
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    const other = state.objects.find((o) => o.ref === node.ref)!;
    if (node.hash !== hash) {
      steps.push(
        `node ${node.ref}: cached hash ${node.hash} ≠ ${hash}, skip without calling equals()`,
      );
      continue;
    }
    if (node.ref === ref) {
      steps.push(
        `node ${node.ref}: hash ${node.hash} matches and it is the same reference`,
      );
      return { bucket, index: i };
    }
    if (other.id === me.id) {
      steps.push(
        `node ${node.ref}: hash matches, equals() compares id ${me.id} = ${other.id}`,
      );
      return { bucket, index: i };
    }
    steps.push(
      `node ${node.ref}: hash ${node.hash} matches, but equals() compares id ${me.id} ≠ ${other.id}`,
    );
  }
  steps.push(`end of bucket ${bucket}, no match`);
  return { bucket, index: -1 };
}

function apply(state: State, op: Op): State {
  const table = state.table.map((c) => [...c]);
  const steps: string[] = [];

  switch (op.kind) {
    case 'new': {
      // Reassigning a variable whose old object is still in the set: the old
      // object stays in the table, now only reachable by iteration.
      const orphan = `${op.ref}′`;
      const keepOld = table.some((c) => c.some((n) => n.ref === op.ref));
      const objects = [
        ...state.objects
          .filter((o) => o.ref !== orphan)
          .flatMap((o) =>
            o.ref !== op.ref ? [o] : keepOld ? [{ ...o, ref: orphan }] : [],
          ),
        { ref: op.ref, id: op.id },
      ];
      return {
        objects,
        table: table.map((c) =>
          c.map((n) =>
            keepOld && n.ref === op.ref ? { ...n, ref: orphan } : n,
          ),
        ),
        trace: {
          code: `Employee ${op.ref} = new Employee(${op.id});`,
          steps: [`a new object on the heap; the set doesn't know about it`],
          tone: 'neutral',
        },
      };
    }
    case 'mutate': {
      const objects = state.objects.map((o) =>
        o.ref === op.ref ? { ...o, id: op.id } : o,
      );
      const stale = table.some((c) => c.some((n) => n.ref === op.ref));
      return {
        objects,
        table,
        trace: {
          code: `${op.ref}.id = ${op.id};`,
          steps: stale
            ? [
                `the field changes; ${op.ref}.hashCode() now returns ${op.id}`,
                `the set isn't notified: the node keeps its old cached hash and stays in its bucket`,
              ]
            : [
                `the field changes; ${op.ref} isn't in the set, so nothing else happens`,
              ],
          tone: stale ? 'bad' : 'neutral',
        },
      };
    }
    case 'add': {
      const { bucket, index } = find(state, op.ref, steps);
      if (index >= 0) {
        steps.push('an equal element is already present, so nothing is stored');
        return {
          ...state,
          trace: {
            code: `set.add(${op.ref})`,
            steps,
            result: 'false',
            tone: 'neutral',
            bucket,
          },
        };
      }
      const me = state.objects.find((o) => o.ref === op.ref)!;
      table[bucket].push({ hash: spread(me.id), ref: op.ref });
      steps.push(
        `append a node to bucket ${bucket}, caching hash ${spread(me.id)}`,
      );
      const copies = table.flat().filter((n) => n.ref === op.ref).length;
      if (copies > 1)
        steps.push(`the set now holds the same object ${copies} times`);
      return {
        ...state,
        table,
        trace: {
          code: `set.add(${op.ref})`,
          steps,
          result: 'true',
          tone: copies > 1 ? 'bad' : 'ok',
          bucket,
        },
      };
    }
    case 'contains': {
      const { bucket, index } = find(state, op.ref, steps);
      const inSet = state.table.some((c) => c.some((n) => n.ref === op.ref));
      const found = index >= 0;
      return {
        ...state,
        trace: {
          code: `set.contains(${op.ref})`,
          steps,
          result: String(found),
          tone: found ? 'ok' : inSet ? 'bad' : 'neutral',
          bucket,
        },
      };
    }
    case 'remove': {
      const { bucket, index } = find(state, op.ref, steps);
      const inSet = state.table.some((c) => c.some((n) => n.ref === op.ref));
      if (index >= 0) {
        table[bucket].splice(index, 1);
        steps.push(`unlink the node from bucket ${bucket}`);
      }
      return {
        ...state,
        table,
        trace: {
          code: `set.remove(${op.ref})`,
          steps,
          result: String(index >= 0),
          tone: index >= 0 ? 'ok' : inSet ? 'bad' : 'neutral',
          bucket,
        },
      };
    }
    case 'size': {
      const size = table.flat().length;
      return {
        ...state,
        trace: {
          code: 'set.size()',
          steps: ['HashMap keeps a counter; no hashing involved'],
          result: String(size),
          tone: 'neutral',
        },
      };
    }
    case 'removeIf': {
      let removed = false;
      for (let b = 0; b < N; b++) {
        const i = table[b].findIndex((n) => n.ref === op.ref);
        if (i >= 0) {
          steps.push(
            `iterator reaches bucket ${b}: e == ${op.ref}, Iterator.remove() unlinks it using its cached hash ${table[b][i].hash}`,
          );
          table[b].splice(i, 1);
          removed = true;
        }
      }
      if (!removed) steps.push('iterated every bucket, nothing matched');
      steps.unshift(
        'walk the table bucket by bucket; no hashCode() call needed',
      );
      return {
        ...state,
        table,
        trace: {
          code: `set.removeIf(e -> e == ${op.ref})`,
          steps,
          result: String(removed),
          tone: removed ? 'ok' : 'neutral',
        },
      };
    }
    case 'rebuild': {
      const order = state.table.flat().map((n) => n.ref);
      let next: State = { ...state, table: emptyTable() };
      const out: string[] = [
        'iterate the old set and add() each element to a new table',
      ];
      for (const ref of order) {
        next = apply(next, { kind: 'add', ref });
        out.push(
          `add(${ref}) → ${next.trace?.result}${next.trace?.result === 'false' ? ' (equal element already there)' : `, bucket ${next.trace?.bucket}`}`,
        );
      }
      return {
        ...next,
        trace: {
          code: 'set = new HashSet<>(set);',
          steps: out,
          tone: 'ok',
          result: `size ${next.table.flat().length}`,
        },
      };
    }
  }
}

interface Scenario {
  key: string;
  label: string;
  ops: Op[];
}

const SCENARIOS: Scenario[] = [
  {
    key: 'bucket',
    label: 'Wrong bucket',
    ops: [
      { kind: 'new', ref: 'emp', id: 1 },
      { kind: 'add', ref: 'emp' },
      { kind: 'mutate', ref: 'emp', id: 2 },
      { kind: 'contains', ref: 'emp' },
      { kind: 'size' },
      { kind: 'remove', ref: 'emp' },
    ],
  },
  {
    key: 'samebucket',
    label: 'Right bucket, still lost',
    ops: [
      { kind: 'new', ref: 'emp', id: 1 },
      { kind: 'add', ref: 'emp' },
      { kind: 'mutate', ref: 'emp', id: 17 },
      { kind: 'contains', ref: 'emp' },
      { kind: 'new', ref: 'probe', id: 1 },
      { kind: 'contains', ref: 'probe' },
    ],
  },
  {
    key: 'duplicate',
    label: 'Duplicate element',
    ops: [
      { kind: 'new', ref: 'emp', id: 1 },
      { kind: 'add', ref: 'emp' },
      { kind: 'mutate', ref: 'emp', id: 2 },
      { kind: 'add', ref: 'emp' },
      { kind: 'size' },
    ],
  },
  {
    key: 'recover',
    label: 'Recovering',
    ops: [
      { kind: 'new', ref: 'emp', id: 1 },
      { kind: 'add', ref: 'emp' },
      { kind: 'mutate', ref: 'emp', id: 2 },
      { kind: 'remove', ref: 'emp' },
      { kind: 'removeIf', ref: 'emp' },
      { kind: 'size' },
    ],
  },
];

const codeOf = (op: Op): string => {
  switch (op.kind) {
    case 'new':
      return `Employee ${op.ref} = new Employee(${op.id});`;
    case 'mutate':
      return `${op.ref}.id = ${op.id};`;
    case 'add':
    case 'contains':
    case 'remove':
      return `set.${op.kind}(${op.ref});`;
    case 'size':
      return 'set.size();';
    case 'removeIf':
      return `set.removeIf(e -> e == ${op.ref});`;
    case 'rebuild':
      return 'set = new HashSet<>(set);';
  }
};

const REFS = ['emp', 'a', 'b', 'c'];

export const HashSetPlayground: React.FC = () => {
  const [mode, setMode] = useState<string>(SCENARIOS[0].key);
  const [state, setState] = useState<State>(initialState);
  const [cursor, setCursor] = useState(0);
  const [ref, setRef] = useState('emp');
  const [idInput, setIdInput] = useState('1');

  const scenario = SCENARIOS.find((s) => s.key === mode);

  const choose = (key: string) => {
    setMode(key);
    setState(initialState());
    setCursor(0);
  };

  const step = () => {
    if (!scenario || cursor >= scenario.ops.length) return;
    setState((s) => apply(s, scenario.ops[cursor]));
    setCursor((c) => c + 1);
  };

  const reset = () => {
    setState(initialState());
    setCursor(0);
  };

  const id = Number.parseInt(idInput, 10);
  const idValid = Number.isInteger(id) && id >= 0 && id <= 9_999_999;
  const exists = state.objects.some((o) => o.ref === ref);
  const run = (op: Op) => setState((s) => apply(s, op));

  const homes = useMemo(() => {
    const m = new Map<string, number[]>();
    state.table.forEach((chain, b) =>
      chain.forEach((n) => m.set(n.ref, [...(m.get(n.ref) ?? []), b])),
    );
    return m;
  }, [state.table]);

  const idOf = (r: string) => state.objects.find((o) => o.ref === r)?.id ?? 0;
  const trace = state.trace;

  return (
    <figure className="hsp" aria-label="Interactive HashSet bucket table">
      <div className="hsp__modes" role="group" aria-label="Scenario">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            type="button"
            className="hsp__mode"
            aria-pressed={mode === s.key}
            onClick={() => choose(s.key)}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          className="hsp__mode"
          aria-pressed={mode === 'free'}
          onClick={() => choose('free')}
        >
          Free play
        </button>
      </div>

      {scenario ? (
        <div className="hsp__script">
          <ol className="hsp__ops">
            {scenario.ops.map((op, i) => (
              <li
                key={i}
                className="hsp__op"
                data-state={
                  i < cursor - 1
                    ? 'done'
                    : i === cursor - 1
                      ? 'current'
                      : 'todo'
                }
              >
                <code>{codeOf(op)}</code>
              </li>
            ))}
          </ol>
          <div className="hsp__controls">
            <button
              type="button"
              className="button button--primary"
              onClick={step}
              disabled={cursor >= scenario.ops.length}
            >
              <StepForward size={16} aria-hidden />
              {cursor === 0
                ? 'Run first line'
                : cursor >= scenario.ops.length
                  ? 'Done'
                  : 'Next line'}
            </button>
            <button
              type="button"
              className="button"
              onClick={reset}
              disabled={cursor === 0}
            >
              <RotateCcw size={16} aria-hidden />
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="hsp__free">
          <div className="hsp__fields">
            <label>
              Variable
              <select value={ref} onChange={(e) => setRef(e.target.value)}>
                {REFS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              id
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={9999999}
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
              />
            </label>
          </div>
          <div className="hsp__actions">
            <button
              type="button"
              className="button"
              disabled={!idValid}
              onClick={() => run({ kind: 'new', ref, id })}
            >
              <code>new Employee({idValid ? id : '…'})</code>
            </button>
            <button
              type="button"
              className="button"
              disabled={!exists || !idValid}
              onClick={() => run({ kind: 'mutate', ref, id })}
            >
              <code>
                {ref}.id = {idValid ? id : '…'}
              </code>
            </button>
            {(['add', 'contains', 'remove'] as const).map((k) => (
              <button
                key={k}
                type="button"
                className="button"
                disabled={!exists}
                onClick={() => run({ kind: k, ref })}
              >
                <code>
                  {k}({ref})
                </code>
              </button>
            ))}
            <button
              type="button"
              className="button"
              disabled={!exists}
              onClick={() => run({ kind: 'removeIf', ref })}
            >
              <code>removeIf(e -&gt; e == {ref})</code>
            </button>
            <button
              type="button"
              className="button"
              onClick={() => run({ kind: 'rebuild' })}
            >
              <code>new HashSet&lt;&gt;(set)</code>
            </button>
            <button type="button" className="button" onClick={reset}>
              <RotateCcw size={16} aria-hidden />
              Reset
            </button>
          </div>
          <p className="hsp__hint">
            Try ids that share low bits, like 1, 17 and 33: they land in the
            same bucket.
          </p>
        </div>
      )}

      <div className="hsp__body">
        <div className="hsp__table-wrap">
          <p className="hsp__label">
            Bucket array, <span className="num">n = 16</span>
          </p>
          <ol className="hsp__table">
            {state.table.map((chain, b) => (
              <li
                key={b}
                className="hsp__bucket"
                data-looked={trace?.bucket === b ? '' : undefined}
              >
                <span className="hsp__index num">{b}</span>
                {chain.map((n, i) => {
                  const current = spread(idOf(n.ref));
                  const stale = current !== n.hash;
                  return (
                    <span
                      key={i}
                      className="hsp__node"
                      data-stale={stale ? '' : undefined}
                    >
                      <span className="hsp__node-ref">{n.ref}</span>
                      <span className="hsp__node-data">
                        hash {n.hash} · id {idOf(n.ref)}
                      </span>
                    </span>
                  );
                })}
              </li>
            ))}
          </ol>
          <p className="hsp__legend">
            <span className="hsp__swatch" data-stale="" aria-hidden /> Stale
            node: its cached hash no longer equals the object&rsquo;s{' '}
            <code>hashCode()</code>.
            <span
              className="hsp__swatch hsp__swatch--looked"
              aria-hidden
            />{' '}
            Bucket the last lookup searched.
          </p>
        </div>

        <div className="hsp__side">
          <div className="hsp__vars">
            <p className="hsp__label">Variables</p>
            {state.objects.length === 0 ? (
              <p className="hsp__empty">No objects yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">ref</th>
                    <th scope="col">id</th>
                    <th scope="col">looks in</th>
                    <th scope="col">lives in</th>
                  </tr>
                </thead>
                <tbody>
                  {state.objects.map((o) => {
                    const looks = bucketOf(spread(o.id));
                    const lives = homes.get(o.ref);
                    const lost = lives !== undefined && !lives.includes(looks);
                    return (
                      <tr key={o.ref}>
                        <td>
                          <code>{o.ref}</code>
                        </td>
                        <td className="num">{o.id}</td>
                        <td className="num" data-lost={lost ? '' : undefined}>
                          {looks}
                        </td>
                        <td className="num">
                          {lives ? lives.join(', ') : 'not in set'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="hsp__trace" aria-live="polite">
            <p className="hsp__label">What the JDK did</p>
            {trace ? (
              <>
                <p className="hsp__trace-code">
                  <code>{trace.code}</code>
                  {trace.result !== undefined && (
                    <span className="hsp__result" data-tone={trace.tone}>
                      {trace.result}
                    </span>
                  )}
                </p>
                <ol className="hsp__steps">
                  {trace.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="hsp__empty">
                {scenario
                  ? 'Run the first line to start.'
                  : 'Create an object to start.'}
              </p>
            )}
          </div>
        </div>
      </div>
      <figcaption className="figure__caption">
        A 16-bucket model of <code>HashMap</code> as{' '}
        <code>HashSet&lt;Employee&gt;</code> uses it. Each node keeps the hash
        it was inserted with, just like <code>HashMap.Node.hash</code>. Resizing
        and tree bins are left out.
      </figcaption>
    </figure>
  );
};

export default HashSetPlayground;
