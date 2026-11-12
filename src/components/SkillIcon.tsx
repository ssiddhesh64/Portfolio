import React from 'react';
import type { SkillIconId } from '../data/resumeData';
import { MARKS } from '../lib/skillMarks';

const svgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
});

/** A steaming cup, after the Java mark: orange steam over a blue cup. */
const JavaCup: React.FC<{ size: number }> = ({ size }) => (
  <svg
    {...svgProps(size)}
    fill="none"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g stroke="currentColor">
      <path d="M9 2.5c-1 1 1 2-.2 3.3M12.5 2c-1.2 1.2 1.2 2.4-.2 4" />
    </g>
    <g stroke="var(--brand-2-now)">
      <path d="M4 10h13v4.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 11.5h1.25a2.25 2.25 0 0 1 0 4.5H16.6" />
      <path d="M3 22h15" />
    </g>
  </svg>
);

interface SkillIconProps {
  icon: SkillIconId;
  size?: number;
}

export const SkillIcon: React.FC<SkillIconProps> = ({ icon, size = 20 }) => {
  const { glyph } = MARKS[icon];
  switch (glyph.kind) {
    case 'java':
      return <JavaCup size={size} />;
    case 'lucide': {
      const Icon = glyph.icon;
      return <Icon size={size} aria-hidden strokeWidth={2} />;
    }
    case 'simple':
      return (
        <svg {...svgProps(size)} fill="currentColor">
          {glyph.inset && (
            <rect x="2" y="2" width="20" height="20" fill={glyph.inset} />
          )}
          <path d={glyph.icon.path} />
        </svg>
      );
  }
};
