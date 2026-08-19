import React from 'react';
import { motion } from 'motion/react';
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
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-2 border-b border-border-subtle bg-canvas"
    >
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20 text-cyan-400 shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-content-primary tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-content-secondary mt-1 max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};
