import React from 'react';
import {
  CircleAlert,
  Info,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

export type CalloutType = 'note' | 'tip' | 'important' | 'warning';

const KINDS: Record<CalloutType, { label: string; Icon: LucideIcon }> = {
  note: { label: 'Note', Icon: Info },
  tip: { label: 'Tip', Icon: Lightbulb },
  important: { label: 'Important', Icon: CircleAlert },
  warning: { label: 'Warning', Icon: TriangleAlert },
};

interface CalloutProps {
  type?: CalloutType;
  /** Replaces the default label ("Warning", "Tip", …). */
  title?: string;
  children: React.ReactNode;
}

/**
 * Written as a GitHub alert (`> [!WARNING]`), or directly as
 * <Callout type="tip" title="Rule of thumb">…</Callout>.
 */
export const Callout: React.FC<CalloutProps> = ({
  type = 'note',
  title,
  children,
}) => {
  const { label, Icon } = KINDS[type] ?? KINDS.note;
  return (
    <aside className={`callout callout--${type}`} aria-label={title ?? label}>
      <p className="callout__label">
        <Icon size={16} aria-hidden />
        {title ?? label}
      </p>
      <div className="callout__body">{children}</div>
    </aside>
  );
};
