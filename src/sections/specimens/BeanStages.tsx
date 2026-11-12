import React, { useState } from 'react';
import { RotateCcw, StepForward } from 'lucide-react';

/*
 * The article's UserService, from definition to singleton cache, in the order
 * AbstractAutowireCapableBeanFactory runs the steps. The readout shows what
 * getBean() would hand back: nothing until the instance exists, the raw
 * class, and finally the CGLIB proxy a BeanPostProcessor substitutes after
 * initialization.
 */

const STAGES = [
  { label: 'BeanDefinition registered', made: '' },
  { label: 'Constructor runs', made: 'UserService' },
  { label: 'Fields and setters injected', made: 'UserService' },
  { label: 'Aware callbacks, @PostConstruct', made: 'UserService' },
  {
    label: 'BeanPostProcessor wraps it',
    made: 'UserService$$SpringCGLIB$$0',
  },
  { label: 'Cached as a singleton', made: 'UserService$$SpringCGLIB$$0' },
];

export const BeanStages: React.FC = () => {
  const [at, setAt] = useState(0);
  const last = at === STAGES.length - 1;
  const made = STAGES[at].made;

  return (
    <div className="spec">
      <ol className="spec__stages">
        {STAGES.map((s, i) => (
          <li
            key={s.label}
            className={
              i === at
                ? 'spec__stage spec__stage--now'
                : i < at
                  ? 'spec__stage spec__stage--done'
                  : 'spec__stage'
            }
            aria-current={i === at ? 'step' : undefined}
          >
            {s.label}
          </li>
        ))}
      </ol>
      <div className="spec__controls">
        <button
          type="button"
          className="spec__btn spec__btn--text"
          onClick={() => setAt(last ? 0 : at + 1)}
        >
          {last ? (
            <RotateCcw size={14} aria-hidden />
          ) : (
            <StepForward size={14} aria-hidden />
          )}
          {last ? 'Start over' : 'Next step'}
        </button>
      </div>
      <p className="spec__readout" aria-live="polite">
        getBean() returns{' '}
        {made ? <code className="spec__code">{made}</code> : 'nothing yet'}
      </p>
    </div>
  );
};
