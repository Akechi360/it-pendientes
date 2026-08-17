import React from 'react';
import { Server, Users, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';

export const AgendaWidget: React.FC = () => {
  const { meetings } = useApp();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings
    .filter((m) => m.startTime.startsWith(todayStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayMeetings.length === 0) {
    return <DashboardEmptyState icon={<CalendarIcon />} title="Agenda libre" message="No tienes reuniones ni eventos programados para hoy." />;
  }

  return (
    <div className="space-y-2 mt-2">
      {todayMeetings.slice(0, 4).map((meeting) => {
        const time = new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <div key={meeting.id} className="p-3 rounded-xl bg-canvas border border-border-subtle flex items-start justify-between gap-3 group hover:border-violet-500/30 transition-colors">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 shrink-0 mt-0.5">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-content-primary truncate">{meeting.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-content-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                  {meeting.modality === 'online' ? <span>Online</span> : <span>Presencial</span>}
                </div>
              </div>
            </div>
            <div className="flex -space-x-1 shrink-0">
               {/* Just showing participant count abstractly since we don't have avatars per participant */}
               {meeting.participants.slice(0, 3).map((_, i) => (
                 <div key={i} className="w-5 h-5 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center">
                   <Users className="w-3 h-3 text-content-muted" />
                 </div>
               ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
