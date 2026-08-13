import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  Video,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import { TaskItem } from '../../types';

export const MeetingsView: React.FC = () => {
  const { meetings, openQuickCreate, toast, isDarkTheme } = useApp();
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Reuniones IT, Minutas & Compromisos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro de sesiones técnicas, comité de cambios (CAB) y asignación directa de acuerdos a tareas.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('meeting')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Programar Reunión
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
            placeholder="Buscar por título o código..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className={`p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
              isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                  {meeting.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{meeting.title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> {meeting.startTime}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">{meeting.objective}</p>

            {meeting.commitments && meeting.commitments.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Compromisos & Acuerdos:
                </h4>
                <div className="space-y-1.5">
                  {meeting.commitments.map((com, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                    >
                      <span>• {com}</span>
                      <button
                        onClick={() => handleCreateTaskFromCommitment(meeting.title, com)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[11px] font-semibold flex items-center gap-1 font-mono transition-all"
                      >
                        <Plus className="w-3 h-3" /> Convertir a Tarea
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
