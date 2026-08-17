import React from 'react';

interface MetricInlineProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
  onClick?: () => void;
}

export const MetricInline: React.FC<MetricInlineProps> = ({ label, value, icon, trend, colorClass = "text-cyan-400", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 lg:p-4 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-canvas border border-border-subtle ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-content-primary leading-none">{value}</span>
            {trend && <span className="text-[10px] text-content-secondary font-medium">{trend}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
