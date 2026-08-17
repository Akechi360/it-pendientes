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
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        
      case 'en_progreso':
      case 'activo':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

      case 'bloqueada':
      case 'bloqueado':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';

      case 'pendiente':
      case 'abierta':
      case 'asignada':
      case 'solicitado':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        
      case 'esperando_usuario':
      case 'esperando_proveedor':
      case 'planificacion':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';

      default:
        return 'text-content-secondary bg-surface-raised border-border-subtle';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono border ${getStatusStyle()}`}>
      {normalizedStatus}
    </span>
  );
};
