import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  DollarSign,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { deleteDocument } from '../../services/supabaseService';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { StatusBadge } from '../shared/StatusBadge';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';
import { DueDateIndicator } from '../shared/DueDateIndicator';

export const RenewalsView: React.FC = () => {
  const { renewals, toast } = useApp();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRenewals = renewals.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta renovación?')) return;
    try {
      await deleteDocument('renewals', id);
      toast('Renovación eliminada', 'success');
    } catch (err) {
      toast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<RefreshCw className="w-5 h-5" />}
        title="Control de Compras & Renovaciones"
        description="Gestión de vencimientos de licencias, dominios, certificados SSL, garantías y suscripciones de software."
        actionLabel="Registrar Renovación"
        onAction={() => toast('Funcionalidad en desarrollo', 'info')}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o proveedor..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Renewals Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Ítem</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 font-semibold">Costo Aprox.</th>
                <th className="px-4 py-3 font-semibold">Frecuencia</th>
                <th className="px-4 py-3 font-semibold">Responsable</th>
                <th className="px-4 py-3 font-semibold">Vencimiento</th>
                {currentUser?.role === 'admin' && <th className="px-4 py-3 font-semibold"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary">
              {filteredRenewals.length === 0 ? (
                <tr><td colSpan={currentUser?.role === 'admin' ? 8 : 7} className="text-center py-10">No hay resultados</td></tr>
              ) : (
                filteredRenewals.map((renewal) => (
                  <tr
                    key={renewal.id}
                    className="hover:bg-surface-hover cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <StatusBadge status={renewal.status} />
                    </td>
                    <td className="px-4 py-3 max-w-xs xl:max-w-md truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-violet-400">{renewal.id}</span>
                        <span className="text-content-primary font-medium group-hover:text-violet-300 transition-colors">{renewal.title}</span>
                      </div>
                      <div className="text-[10px] text-content-muted mt-0.5 truncate capitalize">
                        {renewal.type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-content-primary">{renewal.vendor}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-content-muted" /> {renewal.cost}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-[11px]">{renewal.frequency}</td>
                    <td className="px-4 py-3">
                      <AssigneeAvatar name={renewal.responsibleName} />
                    </td>
                    <td className="px-4 py-3">
                      <DueDateIndicator date={renewal.renewalDate} />
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => handleDelete(renewal.id, e)}
                          className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Eliminar renovación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
