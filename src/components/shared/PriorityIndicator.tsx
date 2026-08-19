import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityIndicatorProps {
  priority: PriorityLevel;
  className?: string;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority, className = '' }) => {
  const getStyles = () => {
    switch (priority) {
      case 'critica': return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20' };
      case 'alta': return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20' };
      case 'media': return { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/20' };
      case 'baja': return { bg: 'bg-content-muted', text: 'text-content-secondary', border: 'border-border-subtle' };
      default: return { bg: 'bg-content-muted', text: 'text-content-secondary', border: 'border-border-subtle' };
    }
  };

  const styles = getStyles();
  const isCritical = priority === 'critica';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border bg-surface-raised ${styles.text} ${styles.border} ${className}`}>
      <span className="relative flex w-1.5 h-1.5">
        {isCritical && <span className={`absolute inline-flex h-full w-full rounded-full ${styles.bg} opacity-75 animate-ping`}></span>}
        <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${styles.bg}`}></span>
      </span>
      {priority}
    </span>
  );
};
