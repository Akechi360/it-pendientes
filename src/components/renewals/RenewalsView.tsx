import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  Server,
  Clock,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RenewalsView: React.FC = () => {
  const { renewals, openQuickCreate, isDarkTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRenewals = renewals.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-400" /> Control de Compras & Renovaciones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de vencimientos de licencias, dominios, certificados SSL, garantías y suscripciones de software.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('renewal')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Renovación
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por servicio o proveedor..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Renewals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRenewals.map((renewal) => (
          <div
            key={renewal.id}
            className={`p-5 rounded-2xl border space-y-3 transition-all ${
              isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                  {renewal.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{renewal.title}</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                renewal.status === 'vencido' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {renewal.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Proveedor</span>
                <strong className="text-slate-200 font-medium">{renewal.vendor}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Costo Estimado</span>
                <strong className="text-emerald-400 font-mono font-medium">${renewal.cost} USD</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Fecha Vencimiento</span>
                <strong className="text-purple-400 font-mono font-medium">{renewal.renewalDate}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Frecuencia</span>
                <strong className="text-slate-200 font-medium capitalize">{renewal.frequency}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
