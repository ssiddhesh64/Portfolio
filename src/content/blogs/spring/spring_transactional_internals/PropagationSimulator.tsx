import React, { useMemo, useState } from 'react';
import { ChevronsRight, RotateCcw, StepForward } from 'lucide-react';

/*
 * A model of what Spring's TransactionInterceptor and
 * AbstractPlatformTransactionManager do when one transactional method calls
 * another, for a single thread and a DataSourceTransactionManager (JDBC
 * savepoints available, so NESTED works).
 *
 *   OrderService.placeOrder()  -- INSERT INTO orders, then calls
 *   AuditService.record()      -- INSERT INTO audit_log, then maybe throws
 *
 * What it models faithfully:
 * - getTransaction(): join / suspend + begin / savepoint / refuse, per
 *   propagation, with and without an existing transaction
 * - rollbackOn(): unchecked exceptions and Errors roll back, checked commit
 * - a participant that fails marks the shared transaction rollback-only, and
 *   the outer commit then throws UnexpectedRollbackException
 * - self-invocation bypasses the proxy, so the inner annotation is ignored
 * What it leaves out: isolation, timeouts, synchronizations, JTA.
 */

type Propagation =
  | 'REQUIRED'
  | 'REQUIRES_NEW'
  | 'NESTED'
  | 'SUPPORTS'
  | 'NOT_SUPPORTED'
  | 'MANDATORY'
  | 'NEVER';

type Outcome = 'returns' | 'unchecked' | 'checked';

interface Config {
  outerTx: boolean;
  viaProxy: boolean;
  propagation: Propagation;
  outcome: Outcome;
  outerCatches: boolean;
}

type TxStatus =
  | 'active'
  | 'rollback-only'
  | 'suspended'
  | 'committed'
  | 'rolled back';

interface Tx {
  name: string;
  conn: number;
  status: TxStatus;
  savepoint: boolean;
}

type RowState = 'uncommitted' | 'committed' | 'rolled back';

interface Row {
  table: 'orders' | 'audit_log';
  state: RowState;
  owner: string;
}

type Actor = 'caller' | 'proxy' | 'manager' | 'outer' | 'inner' | 'db';

interface Step {
  actor: Actor;
  text: string;
  tone?: 'ok' | 'bad';
  txs: Tx[];
  rows: Row[];
}

interface Result {
  steps: Step[];
  callerSees: string;
  callerTone: 'ok' | 'bad';
}

const ACTOR_LABEL: Record<Actor, string> = {
  caller: 'Controller',
  proxy: 'Proxy',
  manager: 'Tx manager',
  outer: 'placeOrder()',
  inner: 'record()',
  db: 'Database',
};

/** Where the inner method's work ends up, decided by getTransaction(). */
type InnerCtx =
  | { kind: 'join'; tx: Tx }
  | { kind: 'new'; tx: Tx; suspended?: Tx }
  | { kind: 'nested'; tx: Tx }
  | { kind: 'none'; suspended?: Tx }
  | { kind: 'self' }
  | { kind: 'refused'; message: string };

function simulate(cfg: Config): Result {
  const txs: Tx[] = [];
  const rows: Row[] = [];
  const steps: Step[] = [];
  let nextConn = 1;

  const log = (actor: Actor, text: string, tone?: 'ok' | 'bad') =>
    steps.push({
      actor,
      text,
      tone,
      txs: txs.map((t) => ({ ...t })),
      rows: rows.map((r) => ({ ...r })),
    });

  const begin = (): Tx => {
    const tx: Tx = {
      name: `T${txs.length + 1}`,
      conn: nextConn++,
      status: 'active',
      savepoint: false,
    };
    txs.push(tx);
    return tx;
  };

  const finish = (tx: Tx, commit: boolean) => {
    tx.status = commit ? 'committed' : 'rolled back';
    for (const r of rows)
      if (r.owner === tx.name || r.owner === `${tx.name} after SP1`)
        r.state = commit ? 'committed' : 'rolled back';
  };

  const insert = (table: Row['table'], owner: Tx | null) => {
    if (owner) {
      const sp = owner.savepoint && table === 'audit_log';
      rows.push({
        table,
        state: 'uncommitted',
        owner: sp ? `${owner.name} after SP1` : owner.name,
      });
    } else {
      rows.push({ table, state: 'committed', owner: 'auto-commit' });
    }
  };

  // 1. The controller calls the outer method through its proxy.
  log('caller', 'calls orderService.placeOrder(order) on the injected proxy');

  let outer: Tx | null = null;
  if (cfg.outerTx) {
    log(
      'proxy',
      'TransactionInterceptor finds @Transactional on placeOrder(): PROPAGATION_REQUIRED',
    );
    outer = begin();
    log(
      'manager',
      `no transaction on this thread, so begin ${outer.name}: borrow connection #${outer.conn}, setAutoCommit(false), bind it to the thread`,
    );
  } else {
    log(
      'proxy',
      'no transaction attribute on placeOrder(): the call goes straight to the target',
    );
  }

  insert('orders', outer);
  log(
    'outer',
    outer
      ? `INSERT INTO orders runs on connection #${outer.conn}, inside ${outer.name}`
      : 'INSERT INTO orders runs on a pooled connection in auto-commit mode and is committed at once',
  );

  // 2. The outer method calls the inner one.
  let ctx: InnerCtx;
  if (!cfg.viaProxy) {
    ctx = { kind: 'self' };
    log(
      'outer',
      `calls this.record(order): a plain Java call on the target object. The proxy never sees it, so @Transactional(propagation = ${cfg.propagation}) is ignored`,
      'bad',
    );
  } else {
    log('outer', 'calls auditService.record(order) on the AuditService proxy');
    log(
      'proxy',
      `TransactionInterceptor finds PROPAGATION_${cfg.propagation} on record()`,
    );
    const p = cfg.propagation;
    if (outer) {
      if (p === 'REQUIRED' || p === 'SUPPORTS' || p === 'MANDATORY') {
        ctx = { kind: 'join', tx: outer };
        log(
          'manager',
          `a transaction exists: participate in ${outer.name}. No new connection, no new transaction`,
        );
      } else if (p === 'REQUIRES_NEW') {
        outer.status = 'suspended';
        const tx = begin();
        ctx = { kind: 'new', tx, suspended: outer };
        log(
          'manager',
          `suspend ${outer.name} (unbind connection #${outer.conn} from the thread), then begin ${tx.name} on a second connection, #${tx.conn}`,
        );
      } else if (p === 'NESTED') {
        outer.savepoint = true;
        ctx = { kind: 'nested', tx: outer };
        log(
          'manager',
          `create savepoint SP1 on connection #${outer.conn}, inside ${outer.name}`,
        );
      } else if (p === 'NOT_SUPPORTED') {
        outer.status = 'suspended';
        ctx = { kind: 'none', suspended: outer };
        log(
          'manager',
          `suspend ${outer.name} and run record() without a transaction`,
        );
      } else {
        ctx = {
          kind: 'refused',
          message:
            "existing transaction found for transaction marked with propagation 'never'",
        };
      }
    } else if (p === 'REQUIRED' || p === 'REQUIRES_NEW' || p === 'NESTED') {
      const tx = begin();
      ctx = { kind: 'new', tx };
      log(
        'manager',
        `no transaction on this thread, so begin ${tx.name} on connection #${tx.conn}${p === 'NESTED' ? ' (NESTED with no outer transaction behaves like REQUIRED)' : ''}`,
      );
    } else if (p === 'MANDATORY') {
      ctx = {
        kind: 'refused',
        message:
          "no existing transaction found for transaction marked with propagation 'mandatory'",
      };
    } else {
      ctx = { kind: 'none' };
      log(
        'manager',
        'no transaction exists and none is required: record() runs without one',
      );
    }
  }

  // 3. The inner method runs (unless getTransaction() refused).
  let innerThrew: 'unchecked' | 'checked' | null = null;
  let thrownName = 'AuditException';

  const resume = (tx?: Tx) => {
    if (!tx) return;
    tx.status = 'active';
    log(
      'manager',
      `resume ${tx.name}: bind connection #${tx.conn} to the thread again`,
    );
  };

  if (ctx.kind === 'refused') {
    log(
      'manager',
      `getTransaction() throws IllegalTransactionStateException: ${ctx.message}. record() never runs`,
      'bad',
    );
    innerThrew = 'unchecked';
    thrownName = 'IllegalTransactionStateException';
  } else {
    const owner =
      ctx.kind === 'join' || ctx.kind === 'new' || ctx.kind === 'nested'
        ? ctx.tx
        : ctx.kind === 'self'
          ? outer
          : null;
    insert('audit_log', owner);
    log(
      'inner',
      owner
        ? `INSERT INTO audit_log runs on connection #${owner.conn}, inside ${owner.name}${ctx.kind === 'nested' ? ' after SP1' : ''}`
        : 'INSERT INTO audit_log runs in auto-commit mode and is committed at once',
    );

    if (cfg.outcome === 'returns') {
      log('inner', 'returns normally');
      if (ctx.kind === 'join')
        log(
          'manager',
          `commit requested, but record() did not start ${ctx.tx.name}, so there is nothing to do: the outer call owns it`,
        );
      else if (ctx.kind === 'new') {
        finish(ctx.tx, true);
        log(
          'manager',
          `commit ${ctx.tx.name} and return connection #${ctx.tx.conn} to the pool. The audit row is now durable`,
          'ok',
        );
        resume(ctx.suspended);
      } else if (ctx.kind === 'nested') {
        ctx.tx.savepoint = false;
        log(
          'manager',
          `release savepoint SP1. The audit row is still uncommitted; it commits or rolls back with ${ctx.tx.name}`,
        );
      } else if (ctx.kind === 'none') {
        log('manager', 'no transaction to commit');
        resume(ctx.suspended);
      }
    } else {
      innerThrew = cfg.outcome;
      const kind =
        cfg.outcome === 'unchecked'
          ? 'AuditException extends RuntimeException'
          : 'AuditException extends Exception (checked)';
      log('inner', `throws ${kind}`, 'bad');
      const rollback = cfg.outcome === 'unchecked';
      if (ctx.kind === 'self') {
        log(
          'inner',
          'no interceptor wraps this.record(), so nothing transactional happens yet; the exception goes straight back to placeOrder()',
        );
      } else if (ctx.kind === 'join') {
        if (rollback) {
          ctx.tx.status = 'rollback-only';
          log(
            'manager',
            `rollbackOn(RuntimeException) is true, but record() did not start ${ctx.tx.name}, so it cannot roll it back. It marks ${ctx.tx.name} rollback-only instead`,
            'bad',
          );
        } else {
          log(
            'manager',
            `rollbackOn(checked exception) is false, so this is the commit path. record() did not start ${ctx.tx.name}: nothing to do`,
          );
        }
      } else if (ctx.kind === 'new') {
        finish(ctx.tx, !rollback);
        log(
          'manager',
          rollback
            ? `rollbackOn(RuntimeException) is true: roll back ${ctx.tx.name}. The audit row is gone`
            : `rollbackOn(checked exception) is false: commit ${ctx.tx.name}, even though the method threw`,
          rollback ? undefined : 'ok',
        );
        resume(ctx.suspended);
      } else if (ctx.kind === 'nested') {
        ctx.tx.savepoint = false;
        if (rollback) {
          for (const r of rows)
            if (r.owner === `${ctx.tx.name} after SP1`) r.state = 'rolled back';
          log(
            'manager',
            `roll back to savepoint SP1: the audit row is undone, the orders row and ${ctx.tx.name} are untouched`,
          );
        } else {
          log(
            'manager',
            'checked exception: release savepoint SP1 and keep the audit row',
          );
        }
      } else {
        log(
          'manager',
          'there is no transaction to roll back. The audit row was already committed by auto-commit',
          'bad',
        );
        resume(ctx.suspended);
      }
    }
  }

  // 4. Back in the outer method.
  let outerThrows: 'unchecked' | 'checked' | null = null;
  if (innerThrew) {
    if (cfg.outerCatches) {
      log('outer', `catches ${thrownName}, logs it, and returns normally`);
    } else {
      outerThrows = innerThrew;
      log('outer', `does not catch ${thrownName}; it propagates out`);
    }
  } else {
    log('outer', 'returns normally');
  }

  let callerSees: string;
  let callerTone: 'ok' | 'bad';
  if (outer) {
    if (outerThrows === 'unchecked') {
      finish(outer, false);
      log(
        'manager',
        `rollbackOn(${thrownName}) is true: roll back ${outer.name}, restore auto-commit, return connection #${outer.conn}`,
      );
      callerSees = thrownName;
      callerTone = 'bad';
    } else if (outer.status === 'rollback-only') {
      finish(outer, false);
      log(
        'manager',
        `commit requested, but ${outer.name} is marked rollback-only: roll back instead and throw UnexpectedRollbackException`,
        'bad',
      );
      callerSees = 'UnexpectedRollbackException';
      callerTone = 'bad';
    } else {
      finish(outer, true);
      log(
        'manager',
        outerThrows === 'checked'
          ? `rollbackOn(checked exception) is false: commit ${outer.name}, then rethrow`
          : `commit ${outer.name}, restore auto-commit, return connection #${outer.conn}`,
        'ok',
      );
      callerSees = outerThrows ? thrownName : 'a normal return';
      callerTone = outerThrows ? 'bad' : 'ok';
    }
  } else {
    callerSees = outerThrows ? thrownName : 'a normal return';
    callerTone = outerThrows ? 'bad' : 'ok';
  }
  log('caller', `receives ${callerSees}`, callerTone);

  return { steps, callerSees, callerTone };
}

const PROPAGATIONS: Propagation[] = [
  'REQUIRED',
  'REQUIRES_NEW',
  'NESTED',
  'SUPPORTS',
  'NOT_SUPPORTED',
  'MANDATORY',
  'NEVER',
];

interface Preset {
  label: string;
  cfg: Config;
}

const PRESETS: Preset[] = [
  {
    label: 'Silent rollback',
    cfg: {
      outerTx: true,
      viaProxy: true,
      propagation: 'REQUIRED',
      outcome: 'unchecked',
      outerCatches: true,
    },
  },
  {
    label: 'Audit survives',
    cfg: {
      outerTx: true,
      viaProxy: true,
      propagation: 'REQUIRES_NEW',
      outcome: 'returns',
      outerCatches: false,
    },
  },
  {
    label: 'Savepoint',
    cfg: {
      outerTx: true,
      viaProxy: true,
      propagation: 'NESTED',
      outcome: 'unchecked',
      outerCatches: true,
    },
  },
  {
    label: 'Self-invocation',
    cfg: {
      outerTx: false,
      viaProxy: false,
      propagation: 'REQUIRES_NEW',
      outcome: 'unchecked',
      outerCatches: false,
    },
  },
  {
    label: 'Checked exception',
    cfg: {
      outerTx: true,
      viaProxy: true,
      propagation: 'REQUIRED',
      outcome: 'checked',
      outerCatches: false,
    },
  },
];

const sameCfg = (a: Config, b: Config) =>
  a.outerTx === b.outerTx &&
  a.viaProxy === b.viaProxy &&
  a.propagation === b.propagation &&
  a.outcome === b.outcome &&
  a.outerCatches === b.outerCatches;

interface SegmentProps<T extends string | boolean> {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}

function Segment<T extends string | boolean>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SegmentProps<T>) {
  return (
    <div className="txs__field" data-disabled={disabled ? '' : undefined}>
      <span className="txs__field-label">{label}</span>
      <div className="txs__seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            className="txs__opt"
            aria-pressed={value === o.value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function codeFor(cfg: Config): string {
  const outerAnn = cfg.outerTx ? '@Transactional\n' : '';
  const call = cfg.viaProxy
    ? 'auditService.record(order);'
    : 'this.record(order);';
  const throwsDecl = cfg.outcome === 'checked' ? ' throws AuditException' : '';
  const body =
    cfg.outcome === 'returns'
      ? ''
      : '\n    throw new AuditException("audit failed");';
  const invoke = cfg.outerCatches
    ? `    try {\n        ${call}\n    } catch (${cfg.outcome === 'checked' ? 'AuditException' : 'RuntimeException'} e) {\n        log.warn("audit failed", e);\n    }`
    : `    ${call}`;
  return `${outerAnn}public void placeOrder(Order order)${cfg.outcome === 'checked' && !cfg.outerCatches ? throwsDecl : ''} {
    orderRepository.insert(order);
${invoke}
}

@Transactional(propagation = Propagation.${cfg.propagation})
public void record(Order order)${throwsDecl} {
    auditRepository.insert(order);${body}
}`;
}

export const PropagationSimulator: React.FC = () => {
  const [cfg, setCfg] = useState<Config>(PRESETS[0].cfg);
  const [cursor, setCursor] = useState<number | null>(null);

  const result = useMemo(() => simulate(cfg), [cfg]);
  const total = result.steps.length;
  const shown = cursor ?? total;
  const current = result.steps[shown - 1];
  const done = shown >= total;

  const update = (patch: Partial<Config>) => {
    setCfg((c) => ({ ...c, ...patch }));
    setCursor(null);
  };

  const throws = cfg.outcome !== 'returns';
  const refused =
    cfg.viaProxy &&
    ((cfg.outerTx && cfg.propagation === 'NEVER') ||
      (!cfg.outerTx && cfg.propagation === 'MANDATORY'));

  return (
    <figure
      className="txs"
      aria-label="Interactive model of transaction propagation"
    >
      <div className="txs__presets" role="group" aria-label="Scenario">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="txs__preset"
            aria-pressed={sameCfg(p.cfg, cfg)}
            onClick={() => update(p.cfg)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="txs__config">
        <div className="txs__fields">
          <Segment
            label="placeOrder() is"
            value={cfg.outerTx}
            onChange={(v) => update({ outerTx: v })}
            options={[
              { value: true, label: <code>@Transactional</code> },
              { value: false, label: 'not annotated' },
            ]}
          />
          <Segment
            label="It calls record() via"
            value={cfg.viaProxy}
            onChange={(v) => update({ viaProxy: v })}
            options={[
              { value: true, label: 'another bean (proxy)' },
              { value: false, label: <code>this</code> },
            ]}
          />
          <Segment
            label="record() propagation"
            value={cfg.propagation}
            onChange={(v) => update({ propagation: v })}
            options={PROPAGATIONS.map((p) => ({ value: p, label: p }))}
          />
          <Segment
            label="record()"
            value={cfg.outcome}
            onChange={(v) => update({ outcome: v })}
            disabled={refused}
            options={[
              { value: 'returns', label: 'returns' },
              { value: 'unchecked', label: 'throws unchecked' },
              { value: 'checked', label: 'throws checked' },
            ]}
          />
          <Segment
            label="placeOrder() on exception"
            value={cfg.outerCatches}
            onChange={(v) => update({ outerCatches: v })}
            disabled={!throws && !refused}
            options={[
              { value: true, label: 'catches it' },
              { value: false, label: 'lets it propagate' },
            ]}
          />
        </div>
        <pre className="txs__code" aria-label="The code being modelled">
          <code>{codeFor(cfg)}</code>
        </pre>
      </div>

      <div className="txs__body">
        <div className="txs__timeline">
          <div className="txs__timeline-head">
            <p className="txs__label">
              What happens, in order{' '}
              <span className="num">
                ({shown}/{total})
              </span>
            </p>
            <div className="txs__controls">
              {cursor === null ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => setCursor(1)}
                >
                  <StepForward size={16} aria-hidden />
                  Step through
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() =>
                      setCursor((c) => Math.min((c ?? 0) + 1, total))
                    }
                    disabled={done}
                  >
                    <StepForward size={16} aria-hidden />
                    Next
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setCursor(null)}
                    disabled={done}
                  >
                    <ChevronsRight size={16} aria-hidden />
                    All
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setCursor(1)}
                  >
                    <RotateCcw size={16} aria-hidden />
                    Restart
                  </button>
                </>
              )}
            </div>
          </div>
          <ol className="txs__steps" aria-live="polite">
            {result.steps.slice(0, shown).map((s, i) => (
              <li
                key={i}
                className="txs__step"
                data-current={
                  i === shown - 1 && cursor !== null ? '' : undefined
                }
                data-tone={s.tone}
              >
                <span className="txs__actor">{ACTOR_LABEL[s.actor]}</span>
                <span className="txs__text">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="txs__side">
          <div>
            <p className="txs__label">Transactions on this thread</p>
            {current.txs.length === 0 ? (
              <p className="txs__empty">None.</p>
            ) : (
              <ul className="txs__txs">
                {current.txs.map((t) => (
                  <li key={t.name} className="txs__tx" data-status={t.status}>
                    <span className="txs__tx-name">{t.name}</span>
                    <span className="txs__tx-meta">
                      connection <span className="num">#{t.conn}</span>
                      {t.savepoint && ' · savepoint SP1'}
                    </span>
                    <span className="txs__badge" data-status={t.status}>
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="txs__label">Rows written</p>
            {current.rows.length === 0 ? (
              <p className="txs__empty">None yet.</p>
            ) : (
              <table className="txs__rows">
                <thead>
                  <tr>
                    <th scope="col">table</th>
                    <th scope="col">written in</th>
                    <th scope="col">state</th>
                  </tr>
                </thead>
                <tbody>
                  {current.rows.map((r) => (
                    <tr key={r.table}>
                      <td>
                        <code>{r.table}</code>
                      </td>
                      <td>{r.owner}</td>
                      <td data-state={r.state}>{r.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {done && (
            <p className="txs__verdict" data-tone={result.callerTone}>
              The controller receives <strong>{result.callerSees}</strong>.{' '}
              {verdictRows(current.rows)}
            </p>
          )}
        </div>
      </div>
      <figcaption className="figure__caption">
        One thread, a <code>DataSourceTransactionManager</code>, and two beans:{' '}
        <code>OrderService.placeOrder()</code> writes an order and calls{' '}
        <code>AuditService.record()</code>, which writes an audit row. Each line
        on the left corresponds to a decision in{' '}
        <code>TransactionAspectSupport</code> or{' '}
        <code>AbstractPlatformTransactionManager</code>. Isolation, timeouts and
        JTA are left out.
      </figcaption>
    </figure>
  );
};

function verdictRows(rows: Row[]): string {
  const state = (t: Row['table']) =>
    rows.find((r) => r.table === t)?.state ?? 'never written';
  const o = state('orders');
  const a = state('audit_log');
  if (o === a) return `Both rows end up ${o}.`;
  return `The order row is ${o}; the audit row is ${a}.`;
}

export default PropagationSimulator;
