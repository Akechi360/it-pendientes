import React from 'react';

interface DashboardSectionProps {
  title: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ title, icon, actionText, onAction, children }) => {
  return (
    <section className="flex flex-col p-5 rounded-2xl border border-border-subtle bg-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle text-content-secondary">
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
    </section>
  );
};
