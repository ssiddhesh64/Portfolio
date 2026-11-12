import React, { useId, useState } from 'react';

/*
 * The article's scenario, cut down to two choices. OrderService.placeOrder()
 * inserts into orders and calls AuditService.record(), which inserts into
 * audit_log. Either the inner call throws an unchecked exception that the
 * outer method catches, or the inner call returns and the outer method then
 * throws. Outcomes follow AbstractPlatformTransactionManager with a JDBC
 * DataSourceTransactionManager (savepoints available).
 */

type Propagation = 'REQUIRED' | 'REQUIRES_NEW' | 'NESTED';
type Failure = 'inner' | 'outer';
type Fate = 'committed' | 'rolled back';

const OUTCOMES: Record<
  Failure,
  Record<Propagation, { orders: Fate; audit: Fate; why: string }>
> = {
  inner: {
    REQUIRED: {
      orders: 'rolled back',
      audit: 'rolled back',
      why: 'The shared transaction was marked rollback-only; the outer commit throws UnexpectedRollbackException.',
    },
    REQUIRES_NEW: {
      orders: 'committed',
      audit: 'rolled back',
      why: 'The inner call ran in its own transaction on its own connection.',
    },
    NESTED: {
      orders: 'committed',
      audit: 'rolled back',
      why: 'Spring rolled back to the savepoint taken before the inner call.',
    },
  },
  outer: {
    REQUIRED: {
      orders: 'rolled back',
      audit: 'rolled back',
      why: 'One transaction, one fate.',
    },
    REQUIRES_NEW: {
      orders: 'rolled back',
      audit: 'committed',
      why: 'The audit row was committed before the outer method failed.',
    },
    NESTED: {
      orders: 'rolled back',
      audit: 'rolled back',
      why: 'A savepoint is part of the outer transaction, so it goes down with it.',
    },
  },
};

const PROPAGATIONS: Propagation[] = ['REQUIRED', 'REQUIRES_NEW', 'NESTED'];
const FAILURES: { id: Failure; label: string }[] = [
  { id: 'inner', label: 'Inner throws' },
  { id: 'outer', label: 'Outer throws' },
];

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
  code,
}: {
  legend: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  code?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="spec__seg">
      <legend className="sr-only">{legend}</legend>
      {options.map((o) => (
        <label key={o.id} className="spec__seg-opt">
          <input
            type="radio"
            name={name}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          {code ? <code>{o.label}</code> : <span>{o.label}</span>}
        </label>
      ))}
    </fieldset>
  );
}

export const PropagationFate: React.FC = () => {
  const [prop, setProp] = useState<Propagation>('REQUIRED');
  const [fail, setFail] = useState<Failure>('inner');
  const out = OUTCOMES[fail][prop];

  return (
    <div className="spec">
      <Segmented
        legend="Propagation of the inner method"
        options={PROPAGATIONS.map((p) => ({ id: p, label: p }))}
        value={prop}
        onChange={setProp}
        code
      />
      <Segmented
        legend="Which method fails"
        options={FAILURES}
        value={fail}
        onChange={setFail}
      />
      <dl className="spec__fates" aria-live="polite">
        {(
          [
            ['orders', out.orders],
            ['audit_log', out.audit],
          ] as const
        ).map(([table, fate]) => (
          <div key={table}>
            <dt>
              <code>{table}</code>
            </dt>
            <dd
              className={
                fate === 'committed'
                  ? 'spec__fate'
                  : 'spec__fate spec__fate--lost'
              }
            >
              {fate}
            </dd>
          </div>
        ))}
      </dl>
      <p className="spec__readout">{out.why}</p>
    </div>
  );
};
