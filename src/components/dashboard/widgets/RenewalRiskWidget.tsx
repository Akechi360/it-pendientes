import React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';

export const RenewalRiskWidget: React.FC = () => {
  const { renewals, setActiveTab } = useApp();

  const atRisk = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido');

  // Sort to put 'vencido' first, then 'proximo_a_renovar'
  atRisk.sort((a, b) => {
    if (a.status === 'vencido' && b.status !== 'vencido') return -1;
    if (b.status === 'vencido' && a.status !== 'vencido') return 1;
    return a.renewalDate.localeCompare(b.renewalDate);
  });

  if (atRisk.length === 0) {
    return <DashboardEmptyState icon={<ShieldCheck />} title="Todo Seguro" message="No hay licencias ni dominios próximos a vencer." />;
  }

  return (
    <div className="space-y-3 mt-2">
      {atRisk.slice(0, 4).map((renewal) => (
        <div 
          key={renewal.id}
          onClick={() => setActiveTab('renewals')}
          className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border-subtle hover:border-amber-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              renewal.status === 'vencido' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-content-primary truncate">{renewal.title}</h4>
              <p className="text-[10px] text-content-secondary mt-0.5 truncate">{renewal.vendor} • {renewal.type}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              renewal.status === 'vencido' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {renewal.status === 'vencido' ? 'VENCIDO' : 'PRÓXIMO'}
            </span>
            <span className="text-[11px] font-mono text-content-muted">{renewal.renewalDate}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
