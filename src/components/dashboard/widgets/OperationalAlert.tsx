import React from 'react';
import { motion } from 'motion/react';
import { Siren, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const OperationalAlert: React.FC = () => {
  const { incidents, tasks, renewals, setActiveTab } = useApp();

  const openIncidents = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
  const criticalIncidents = openIncidents.filter((i) => i.priority === 'critica' || i.priority === 'alta');

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completada' && t.status !== 'cancelada');
  const urgentRenewals = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido');

  const motionProps = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  };

  if (criticalIncidents.length > 0) {
    return (
      <motion.button
        {...motionProps}
        onClick={() => setActiveTab('incidents')}
        className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-surface to-surface border border-rose-500/30 text-left transition-all hover:border-rose-500/50 cursor-pointer group overflow-hidden"
      >
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-xl bg-rose-500/20 opacity-75 animate-ping" />
          <Siren className="relative w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-content-primary">Atención Crítica Requerida</h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Hay {criticalIncidents.length} incidencia{criticalIncidents.length !== 1 ? 's' : ''} crítica{criticalIncidents.length !== 1 ? 's' : ''} abiertas. Haga clic para ver detalles.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-rose-400 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </motion.button>
    );
  }

  if (urgentRenewals.length > 0 || overdueTasks.length > 0) {
    return (
      <motion.button
        {...motionProps}
        onClick={() => setActiveTab(urgentRenewals.length > 0 ? 'renewals' : 'tasks')}
        className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface to-surface border border-amber-500/30 text-left transition-all hover:border-amber-500/50 cursor-pointer group"
      >
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-content-primary">Atención Operativa</h3>
          <p className="text-xs text-content-secondary mt-0.5">
            {urgentRenewals.length > 0
              ? `Hay ${urgentRenewals.length} renovación(es) en riesgo.`
              : `Hay ${overdueTasks.length} tarea(s) vencida(s).`} Haga clic para revisar.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </motion.button>
    );
  }

  return (
    <motion.div
      {...motionProps}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface to-surface border border-emerald-500/30 text-left"
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-content-primary">Operación Saludable</h3>
        <p className="text-xs text-content-secondary mt-0.5">
          No hay incidencias críticas ni tareas vencidas. Todos los sistemas operan con normalidad.
        </p>
      </div>
    </motion.div>
  );
};
