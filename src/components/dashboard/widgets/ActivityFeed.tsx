import React from 'react';
import { History } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';
import { Avatar } from '../../shared/Avatar';

export const ActivityFeed: React.FC = () => {
  const { activityLogs } = useApp();

  if (activityLogs.length === 0) {
    return <DashboardEmptyState icon={<History />} title="Sin Actividad" message="No se han registrado operaciones recientes." />;
  }

  const items = activityLogs.slice(0, 5);

  return (
    <div className="mt-1">
      {items.map((log, idx) => (
        <div key={log.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
          {idx < items.length - 1 && (
            <span className="absolute left-4 top-8 bottom-0 w-px bg-border-subtle" />
          )}
          <Avatar name={log.actorName} size="xs" className="relative z-10 mt-0.5" />
          <div className="flex-1 overflow-hidden pt-0.5">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <strong className="text-content-primary font-semibold text-xs truncate">{log.actorName}</strong>
              <span className="text-[10px] text-content-muted font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-content-secondary text-xs truncate">
              {log.action}: <span className="text-content-primary font-medium">{log.entityTitle}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
