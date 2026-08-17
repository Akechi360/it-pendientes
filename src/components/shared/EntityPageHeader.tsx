import React from 'react';
import { Plus } from 'lucide-react';

interface EntityPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EntityPageHeader: React.FC<EntityPageHeaderProps> = ({ icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle bg-canvas">
      <div>
        <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
          <span className="text-cyan-400">{icon}</span> {title}
        </h1>
        <p className="text-xs text-content-secondary mt-1 max-w-2xl">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-surface-raised border border-border-subtle hover:bg-surface-hover text-content-primary transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-cyan-400" /> {actionLabel}
        </button>
      )}
    </div>
  );
};
