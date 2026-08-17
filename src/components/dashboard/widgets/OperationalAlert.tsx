import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { IncidentItem, TaskItem, RenewalItem } from '../../../types';
import { useApp } from '../../../context/AppContext';

export const OperationalAlert: React.FC = () => {
  const { incidents, tasks, renewals, setActiveTab } = useApp();

  const openIncidents = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
  const criticalIncidents = openIncidents.filter((i) => i.priority === 'critica' || i.priority === 'alta');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completada' && t.status !== 'cancelada');
  const urgentRenewals = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido');

  if (criticalIncidents.length > 0) {
    return (
      <button 
        onClick={() => setActiveTab('incidents')}
        className="w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-surface border border-rose-500/30 text-left transition-colors hover:bg-surface-raised cursor-pointer"
      >
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-content-primary">Atención Crítica Requerida</h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Hay {criticalIncidents.length} incidencia{criticalIncidents.length !== 1 ? 's' : ''} crítica{criticalIncidents.length !== 1 ? 's' : ''} abiertas. Haga clic para ver detalles.
          </p>
        </div>
      </button>
    );
  }

  if (urgentRenewals.length > 0 || overdueTasks.length > 0) {
    return (
      <button 
        onClick={() => setActiveTab(urgentRenewals.length > 0 ? 'renewals' : 'tasks')}
        className="w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-surface border border-amber-500/30 text-left transition-colors hover:bg-surface-raised cursor-pointer"
      >
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-content-primary">Atención Operativa</h3>
          <p className="text-xs text-content-secondary mt-0.5">
            {urgentRenewals.length > 0 
              ? `Hay ${urgentRenewals.length} renovación(es) en riesgo.` 
              : `Hay ${overdueTasks.length} tarea(s) vencida(s).`} Haga clic para revisar.
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-surface border border-emerald-500/30 text-left">
      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-content-primary">Operación Saludable</h3>
        <p className="text-xs text-content-secondary mt-0.5">
          No hay incidencias críticas ni tareas vencidas. Todos los sistemas operan con normalidad.
        </p>
      </div>
    </div>
  );
};

// Se importa localmente aquí para evitar problema de ciclo si estuviera global
const AlertOctagon = AlertCircle;
