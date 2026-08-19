import React from 'react';
import { getDaysDifference, formatDate } from '../../utils/dateUtils';
import { Clock, AlertOctagon } from 'lucide-react';

interface DueDateIndicatorProps {
  date: string | null | undefined;
  type?: 'dueDate' | 'sla';
}

export const DueDateIndicator: React.FC<DueDateIndicatorProps> = ({ date, type = 'dueDate' }) => {
  if (!date) {
    return <span className="text-[11px] text-content-muted">Sin {type === 'sla' ? 'SLA configurado' : 'fecha configurada'}</span>;
  }

  const diff = getDaysDifference(date);
  const formatted = formatDate(date);

  if (diff === null) return null;

  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">
        <AlertOctagon className="w-3 h-3" /> Vencido
      </span>
    );
  }

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Vence Hoy
      </span>
    );
  }

  if (diff <= 2) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-content-primary">
        <Clock className="w-3 h-3 text-content-muted" /> En {diff} días
      </span>
    );
  }

  return (
    <span className="text-[11px] font-mono text-content-secondary">
      {formatted}
    </span>
  );
};
