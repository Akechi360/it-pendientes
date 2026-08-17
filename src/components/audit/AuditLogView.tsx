import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Search,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { formatDate } from '../../utils/dateUtils';

export const AuditLogView: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter((l) => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.entityTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        title="Bitácora de Auditoría Operativa"
        description="Registro inmutable de acciones, cambios de estado, creaciones y eliminaciones realizadas en la plataforma."
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, acción o elemento..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <span className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold self-start md:self-auto shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> Registro Inmutable Supabase
        </span>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha y Hora</th>
                <th className="px-4 py-3 font-semibold">Usuario / Actor</th>
                <th className="px-4 py-3 font-semibold">Acción Registrada</th>
                <th className="px-4 py-3 font-semibold">Módulo</th>
                <th className="px-4 py-3 font-semibold">Elemento Afectado</th>
                <th className="px-4 py-3 font-semibold">Detalle Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 font-sans text-xs">No hay registros</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-4 py-3 text-content-muted">
                      {formatDate(log.timestamp, true)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-content-primary flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400" /> {log.actorName}
                    </td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{log.action}</td>
                    <td className="px-4 py-3 capitalize text-content-muted">{log.module}</td>
                    <td className="px-4 py-3 font-semibold text-content-primary truncate max-w-[200px]">{log.entityTitle}</td>
                    <td className="px-4 py-3 text-content-muted truncate max-w-xs" title={log.details}>{log.details}</td>
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
