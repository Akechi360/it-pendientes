import React from 'react';
import { motion } from 'motion/react';

interface DashboardSectionProps {
  title: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ title, icon, actionText, onAction, children }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col p-5 rounded-2xl border border-border-subtle bg-surface hover:border-border-active/20 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-border-subtle text-cyan-400">
            {icon}
          </div>
          <h2 className="text-sm font-bold text-content-primary tracking-tight">{title}</h2>
        </div>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </motion.section>
  );
};
