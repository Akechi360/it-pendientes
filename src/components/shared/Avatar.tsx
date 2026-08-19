import React from 'react';

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-fuchsia-500 to-pink-600',
  'from-teal-500 to-cyan-600',
];

const SIZE_MAP: Record<string, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, photoURL, size = 'sm', ring = false, className = '' }) => {
  const sizeClass = SIZE_MAP[size];
  const gradient = GRADIENTS[hashName(name || '?') % GRADIENTS.length];
  const ringClass = ring ? 'ring-2 ring-offset-2 ring-offset-surface ring-cyan-500/40' : '';

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${ringClass} ${className}`}
    >
      {getInitials(name) || '?'}
    </div>
  );
};
