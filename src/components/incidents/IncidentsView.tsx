import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IncidentDetailModal } from './IncidentDetailModal';

export const IncidentsView: React.FC = () => {
  const { incidents, openQuickCreate, setSelectedIncident, isDarkTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <IncidentDetailModal />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-amber-400" /> Helpdesk & Incidencias Técnicas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro, diagnóstico y resolución de fallas de infraestructura, red, equipos y aplicaciones.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('incident')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Incidencia
        </button>
      </div>

      {/* Search */}
      <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, título o solicitante..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            onClick={() => setSelectedIncident(incident)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-amber-500/50 ${
              isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {incident.id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase font-mono ${
                  incident.priority === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {incident.priority}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono capitalize">
                  {incident.category}
                </span>
              </div>

              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> SLA: {incident.slaDueDate}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-100 mb-1.5">{incident.title}</h3>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Solicitado por: <strong className="text-slate-200">{incident.requester}</strong></span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                Atender <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
