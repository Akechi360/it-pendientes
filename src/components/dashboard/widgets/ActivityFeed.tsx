import React from 'react';
import { History, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';

export const ActivityFeed: React.FC = () => {
  const { activityLogs } = useApp();

  if (activityLogs.length === 0) {
    return <DashboardEmptyState icon={<History />} title="Sin Actividad" message="No se han registrado operaciones recientes." />;
  }

  return (
    <div className="space-y-3 mt-2">
      {activityLogs.slice(0, 5).map((log) => (
        <div key={log.id} className="p-3 rounded-xl bg-canvas border border-border-subtle text-xs flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle text-cyan-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-content-primary font-semibold">{log.actorName}</strong>
              <span className="text-[10px] text-content-muted font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-content-secondary truncate">
              {log.action}: <span className="text-content-primary">{log.entityTitle}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
