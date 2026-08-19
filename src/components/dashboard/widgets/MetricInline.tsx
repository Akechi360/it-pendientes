import React from 'react';
import { motion } from 'motion/react';

interface MetricInlineProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
  glowClass?: string;
  onClick?: () => void;
}

export const MetricInline: React.FC<MetricInlineProps> = ({
  label,
  value,
  icon,
  trend,
  colorClass = 'text-cyan-400 border-cyan-500/20',
  glowClass = 'hover:shadow-cyan-500/10',
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-between p-4 lg:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-active/30 hover:shadow-xl ${glowClass} transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-canvas to-surface-raised border ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-content-primary leading-none tabular-nums">{value}</span>
            {trend && <span className="text-[10px] text-content-secondary font-semibold">{trend}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
