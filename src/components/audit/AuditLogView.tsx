import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogView: React.FC = () => {
  const { activityLogs, isDarkTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter((l) => l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) || l.entityTitle.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Bitácora de Auditoría Operativa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmutable de acciones, cambios de estado, creaciones y eliminaciones realizadas en la plataforma.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold self-start md:self-auto">
          <Activity className="w-4 h-4 animate-pulse" /> Registro Inmutable Firestore
        </span>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, acción o elemento..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Usuario / Actor</th>
              <th className="p-3">Acción Registrada</th>
              <th className="p-3">Módulo</th>
              <th className="p-3">Elemento Afectado</th>
              <th className="p-3">Detalle Operación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 text-slate-400 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3 font-semibold text-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> {log.actorName}
                </td>
                <td className="p-3 font-bold text-cyan-400">{log.action}</td>
                <td className="p-3 capitalize text-slate-300">{log.module}</td>
                <td className="p-3 font-semibold text-slate-200">{log.entityTitle}</td>
                <td className="p-3 text-slate-400 text-[11px]">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
