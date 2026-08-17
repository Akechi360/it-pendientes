import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Clock,
  CheckSquare,
  Video,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createDocument } from '../../services/supabaseService';
import { TaskItem } from '../../types';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { formatDate } from '../../utils/dateUtils';
import { StatusBadge } from '../shared/StatusBadge';

export const MeetingsView: React.FC = () => {
  const { meetings, openQuickCreate, toast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetings.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateTaskFromCommitment = async (meetingTitle: string, commitmentText: string) => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const taskId = `TASK-${year}-${randStr}`;

    const newTask: TaskItem = {
      id: taskId,
      title: commitmentText,
      description: `Acuerdo derivado de la reunión: ${meetingTitle}`,
      status: 'pendiente',
      priority: 'media',
      category: 'administracion',
      assigneeId: 'usr_admin_01',
      assigneeName: 'Carlos Mendoza',
      creatorId: 'usr_admin_01',
      creatorName: 'Carlos Mendoza',
      dueDate: new Date().toISOString().split('T')[0],
      tags: ['AcuerdoReunión'],
      checklist: [],
      comments: [],
      isBlocked: false,
      isFocused: false,
      isArchived: false,
      organizationId: 'org_sistemas_main',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('tasks', newTask);
      toast(`Tarea ${taskId} creada desde acuerdo de reunión`, 'success');
    } catch (err) {
      toast('Error al crear tarea', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<Users className="w-5 h-5" />}
        title="Reuniones IT, Minutas & Compromisos"
        description="Registro de sesiones técnicas, comité de cambios (CAB) y asignación directa de acuerdos a tareas."
        actionLabel="Programar Reunión"
        onAction={() => openQuickCreate('meeting')}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o código..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-border-subtle bg-surface text-content-secondary text-sm">
            No se encontraron reuniones.
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex flex-col lg:flex-row gap-4 p-5 rounded-2xl border border-border-subtle bg-surface hover:border-violet-500/30 transition-colors shadow-sm group"
            >
              {/* Left Column: Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    {meeting.id}
                  </span>
                  <StatusBadge status={meeting.status} />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-raised border border-border-subtle text-content-secondary font-mono capitalize">
                    {meeting.modality}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-content-primary group-hover:text-violet-300 transition-colors">{meeting.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-content-muted font-mono">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-400" /> {formatDate(meeting.startTime, true)}</span>
                    {meeting.location && (
                      <span className="flex items-center gap-1.5 text-content-secondary">
                        {meeting.modality === 'remota' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-canvas border border-border-subtle text-xs text-content-secondary leading-relaxed">
                  {meeting.objective}
                </div>
              </div>

              {/* Right Column: Commitments */}
              {meeting.commitments && meeting.commitments.length > 0 && (
                <div className="lg:w-96 flex flex-col gap-2 pt-4 border-t lg:border-t-0 lg:border-l border-border-subtle lg:pl-5">
                  <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Compromisos ({meeting.commitments.length})
                  </h4>
                  <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-48">
                    {meeting.commitments.map((com, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 p-2.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary"
                      >
                        <p className="leading-snug">{com}</p>
                        <button
                          onClick={() => handleCreateTaskFromCommitment(meeting.title, com)}
                          className="self-start px-2 py-1 rounded bg-surface border border-border-subtle hover:bg-surface-hover text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> A Tarea
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
