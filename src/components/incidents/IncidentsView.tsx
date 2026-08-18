import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { EntityPageHeader } from '../shared/EntityPageHeader';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityIndicator } from '../shared/PriorityIndicator';
import { DueDateIndicator } from '../shared/DueDateIndicator';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';
import { formatDate } from '../../utils/dateUtils';

export const IncidentsView: React.FC = () => {
  const { incidents, openQuickCreate, setSelectedIncident } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('activas');

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          incident.requester.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'activas') {
      matchesStatus = incident.status !== 'resuelta' && incident.status !== 'cerrada' && incident.status !== 'cancelada';
    } else if (selectedStatus === 'cerradas') {
      matchesStatus = incident.status === 'resuelta' || incident.status === 'cerrada' || incident.status === 'cancelada';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<LifeBuoy className="w-5 h-5" />}
        title="Helpdesk & Incidencias Técnicas"
        description="Registro, diagnóstico y resolución de fallas de infraestructura, red, equipos y aplicaciones."
        actionLabel="Nueva Incidencia"
        onAction={() => openQuickCreate('incident')}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, título o solicitante..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:border-amber-500/50"
          >
            <option value="activas">Solo Activas</option>
            <option value="cerradas">Solo Cerradas</option>
            <option value="todas">Todas</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">ID / Incidencia</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Área / Categoría</th>
                <th className="px-4 py-3 font-semibold">Responsable</th>
                <th className="px-4 py-3 font-semibold">Abierta Desde</th>
                <th className="px-4 py-3 font-semibold">Vence SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary">
              {filteredIncidents.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10">No hay resultados</td></tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="hover:bg-surface-hover cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <PriorityIndicator priority={incident.priority} />
                    </td>
                    <td className="px-4 py-3 max-w-xs xl:max-w-md truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{incident.id}</span>
                        <span className="text-content-primary font-medium group-hover:text-amber-300 transition-colors">{incident.title}</span>
                      </div>
                      <div className="text-[10px] text-content-muted mt-0.5 truncate">
                        Solicitante: {incident.requester}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-4 py-3 capitalize text-[11px]">{incident.category}</td>
                    <td className="px-4 py-3">
                      <AssigneeAvatar name={incident.assigneeName} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {formatDate(incident.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DueDateIndicator date={incident.slaDueDate} type="sla" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
