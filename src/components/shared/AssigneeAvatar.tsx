import React from 'react';
import { User } from 'lucide-react';
import { Avatar } from './Avatar';

interface AssigneeAvatarProps {
  name: string | null | undefined;
}

export const AssigneeAvatar: React.FC<AssigneeAvatarProps> = ({ name }) => {
  if (!name || name === 'Sin asignar' || name.trim() === '') {
    return (
      <div className="flex items-center gap-1.5 text-content-muted">
        <div className="w-5 h-5 rounded-full bg-surface-raised border border-dashed border-border-subtle flex items-center justify-center">
          <User className="w-3 h-3" />
        </div>
        <span className="text-[11px] italic">Sin asignar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-content-primary">
      <Avatar name={name} size="xs" />
      <span className="text-[11px] truncate max-w-[120px] font-medium" title={name}>{name}</span>
    </div>
  );
};
