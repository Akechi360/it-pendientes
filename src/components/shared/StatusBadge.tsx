import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.replace(/_/g, ' ').toUpperCase();

  const getStatusStyle = () => {
    switch (status) {
      // Tareas
      case 'completada':
      // Incidencias
      case 'resuelta':
      case 'cerrada':
      // Proyectos
      case 'finalizado':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' };

      case 'en_progreso':
      case 'activo':
        return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-500' };

      case 'bloqueada':
      case 'bloqueado':
        return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' };

      case 'pendiente':
      case 'abierta':
      case 'asignada':
      case 'solicitado':
        return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' };

      case 'esperando_usuario':
      case 'esperando_proveedor':
      case 'planificacion':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' };

      default:
        return { text: 'text-content-secondary', bg: 'bg-surface-raised', border: 'border-border-subtle', dot: 'bg-content-muted' };
    }
  };

  const s = getStatusStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono border ${s.text} ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {normalizedStatus}
    </span>
  );
};
