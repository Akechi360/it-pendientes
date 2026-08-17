import React from 'react';
import { User } from 'lucide-react';

interface AssigneeAvatarProps {
  name: string | null | undefined;
}

export const AssigneeAvatar: React.FC<AssigneeAvatarProps> = ({ name }) => {
  if (!name || name === 'Sin asignar' || name.trim() === '') {
    return (
      <div className="flex items-center gap-1.5 text-content-muted">
        <div className="w-5 h-5 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center">
          <User className="w-3 h-3" />
        </div>
        <span className="text-[11px] italic">Sin asignar</span>
      </div>
    );
  }

  // Get initials (max 2 characters)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 text-content-primary">
      <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-cyan-400">{initials}</span>
      </div>
      <span className="text-[11px] truncate max-w-[120px] font-medium" title={name}>{name}</span>
    </div>
  );
};
