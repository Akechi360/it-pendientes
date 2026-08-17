import React from 'react';

interface DashboardEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border-subtle bg-canvas text-center">
      <div className="p-3 rounded-xl bg-surface border border-border-subtle text-content-muted mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-content-primary mb-1">{title}</h4>
      <p className="text-xs text-content-muted max-w-xs mx-auto leading-relaxed">{message}</p>
    </div>
  );
};
