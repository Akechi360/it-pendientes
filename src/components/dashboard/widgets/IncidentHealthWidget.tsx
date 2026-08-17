import React from 'react';
import { ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';

export const IncidentHealthWidget: React.FC = () => {
  const { incidents, setActiveTab } = useApp();
  
  const openIncidents = incidents.filter(i => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
  const critical = openIncidents.filter(i => i.priority === 'critica');
  const high = openIncidents.filter(i => i.priority === 'alta');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const breachedSLA = openIncidents.filter(i => i.slaDueDate && i.slaDueDate < todayStr);

  if (incidents.length === 0) {
    return <DashboardEmptyState icon={<CheckCircle2 />} title="Sin Incidencias" message="No se han registrado incidencias en el sistema." />;
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-canvas border border-border-subtle text-center">
          <span className="block text-2xl font-bold text-rose-400">{critical.length}</span>
          <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider">Críticas</span>
        </div>
        <div className="p-3 rounded-lg bg-canvas border border-border-subtle text-center">
          <span className="block text-2xl font-bold text-amber-400">{high.length}</span>
          <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider">Altas</span>
        </div>
        <div className="p-3 rounded-lg bg-canvas border border-border-subtle text-center">
          <span className="block text-2xl font-bold text-content-primary">{openIncidents.length}</span>
          <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider">Total</span>
        </div>
      </div>
      
      {breachedSLA.length > 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <Clock className="w-4 h-4 shrink-0" />
          <span><strong>{breachedSLA.length} incidencias</strong> fuera de SLA o vencidas.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>SLA general saludable. Ninguna incidencia vencida.</span>
        </div>
      )}
    </div>
  );
};
