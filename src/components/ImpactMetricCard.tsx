import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ImpactMetric } from '../data/resumeData';

interface ImpactMetricCardProps {
  metric: ImpactMetric;
  isActive: boolean;
  onSelect: () => void;
}

export const ImpactMetricCard: React.FC<ImpactMetricCardProps> = ({
  metric,
  isActive,
  onSelect,
}) => (
  <button
    type="button"
    className={`impact-card ${isActive ? 'active' : ''}`}
    onClick={onSelect}
    aria-pressed={isActive}
  >
    <span className="impact-value">{metric.value}</span>
    <span className="impact-label">{metric.label}</span>
    <span className="impact-context">{metric.context}</span>
    <span className="impact-proof">
      Proof <ArrowRight size={14} />
    </span>
  </button>
);
