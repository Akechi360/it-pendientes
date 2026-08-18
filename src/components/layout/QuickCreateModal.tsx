import React, { useState } from 'react';
import {
  X, PlusCircle, CheckSquare, LifeBuoy, Users, FolderKanban
} from 'lucide-react';
import { useApp, QuickCreateType } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import {
  TaskItem, IncidentItem, MeetingItem, ProjectItem, RenewalItem
} from '../../types';

export const QuickCreateModal: React.FC = () => {
  const { isQuickCreateOpen, setIsQuickCreateOpen, quickCreateType, toast } = useApp();
  const { currentUser } = useAuth();

  const [type, setType] = useState<QuickCreateType>(quickCreateType);
  const [loading, setLoading] = useState(false);

  // Sync internal state when context changes
  React.useEffect(() => {
    if (isQuickCreateOpen) {
      setType(quickCreateType);
    }
  }, [isQuickCreateOpen, quickCreateType]);

  // Common State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Task State
  const [taskPriority, setTaskPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [taskCategory, setTaskCategory] = useState('soporte');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Incident State
  const [incCategory, setIncCategory] = useState('software');
  const [incImpact, setIncImpact] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [incUrgency, setIncUrgency] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [incSlaDate, setIncSlaDate] = useState(new Date().toISOString().split('T')[0]);

  // Meeting State
  const [meetStartTime, setMeetStartTime] = useState(`${new Date().toISOString().split('T')[0]}T10:00`);
  const [meetEndTime, setMeetEndTime] = useState(`${new Date().toISOString().split('T')[0]}T11:00`);
  const [meetModality, setMeetModality] = useState<'presencial' | 'remota' | 'hibrida'>('remota');

  // Project State
  const [projPriority, setProjPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projTargetDate, setProjTargetDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isQuickCreateOpen) return null;

  const handleClose = () => {
    setIsQuickCreateOpen(false);
    setTitle('');
    setDescription('');
  };

  const generateId = (prefix: string) => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}-${year}-${randStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) {
      toast('El título es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (type === 'task') {
        const id = generateId('TASK');
        const newTask: TaskItem = {
          id, title, description,
          status: 'pendiente',
          priority: taskPriority,
          category: taskCategory as any,
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          creatorId: currentUser.uid,
          creatorName: currentUser.displayName,
          dueDate: taskDueDate,
          tags: ['Rápido', taskCategory],
          checklist: [],
          comments: [],
          isBlocked: false,
          isFocused: false,
          isArchived: false,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('tasks', newTask);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Tarea', 'Tareas', id, title, 'Tarea creada mediante acceso rápido.');
        toast(`Tarea ${id} creada`, 'success');
      } 
      
      else if (type === 'incident') {
        const id = generateId('INC');
        // Simple priority calculation based on impact/urgency
        const priorityScore = (incImpact === 'critica' ? 4 : incImpact === 'alta' ? 3 : incImpact === 'media' ? 2 : 1) +
                              (incUrgency === 'critica' ? 4 : incUrgency === 'alta' ? 3 : incUrgency === 'media' ? 2 : 1);
        const finalPriority = priorityScore >= 7 ? 'critica' : priorityScore >= 5 ? 'alta' : priorityScore >= 3 ? 'media' : 'baja';

        const newInc: IncidentItem = {
          id, title, description,
          category: incCategory as any,
          impact: incImpact,
          urgency: incUrgency,
          priority: finalPriority,
          status: 'abierta',
          requester: currentUser.displayName,
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          slaDueDate: `${incSlaDate}T18:00:00`,
          comments: [],
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('incidents', newInc);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro de Incidencia', 'Incidencias', id, title, 'Incidencia registrada mediante acceso rápido.');
        toast(`Incidencia ${id} registrada`, 'success');
      } 
      
      else if (type === 'meeting') {
        const id = generateId('MEET');
        const newMeet: MeetingItem = {
          id, title,
          objective: description,
          startTime: new Date(meetStartTime).toISOString(),
          endTime: new Date(meetEndTime).toISOString(),
          participants: [currentUser.displayName],
          modality: meetModality,
          status: 'programada',
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('meetings', newMeet);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Programación de Reunión', 'Reuniones', id, title, 'Reunión programada mediante acceso rápido.');
        toast(`Reunión ${id} programada`, 'success');
      } 
      
      else if (type === 'project') {
        const id = generateId('PROJ');
        const newProj: ProjectItem = {
          id, name: title, description,
          status: 'planificacion',
          priority: projPriority,
          leadId: currentUser.uid,
          leadName: currentUser.displayName,
          participants: [currentUser.displayName],
          progress: 0,
          startDate: projStartDate,
          targetDate: projTargetDate,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('projects', newProj);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Proyecto', 'Proyectos', id, title, 'Proyecto iniciado mediante acceso rápido.');
        toast(`Proyecto ${id} creado`, 'success');
      }

      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar el registro', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" /> Nuevo Registro
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-5">
          <button type="button" onClick={() => setType('task')} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-colors ${type === 'task' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-surface-raised border-border-subtle text-content-muted hover:text-content-primary hover:bg-surface-hover'}`}>
            <CheckSquare className="w-4 h-4" /> Tarea
          </button>
          <button type="button" onClick={() => setType('incident')} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-colors ${type === 'incident' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-surface-raised border-border-subtle text-content-muted hover:text-content-primary hover:bg-surface-hover'}`}>
            <LifeBuoy className="w-4 h-4" /> Incidencia
          </button>
          <button type="button" onClick={() => setType('meeting')} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-colors ${type === 'meeting' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-surface-raised border-border-subtle text-content-muted hover:text-content-primary hover:bg-surface-hover'}`}>
            <Users className="w-4 h-4" /> Reunión
          </button>
          <button type="button" onClick={() => setType('project')} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-colors ${type === 'project' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-surface-raised border-border-subtle text-content-muted hover:text-content-primary hover:bg-surface-hover'}`}>
            <FolderKanban className="w-4 h-4" /> Proyecto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
              {type === 'meeting' ? 'Asunto / Título *' : type === 'project' ? 'Nombre del Proyecto *' : 'Título *'}
            </label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Escribe el título..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50 text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
              {type === 'meeting' ? 'Objetivo de la Reunión' : 'Descripción / Notas'}
            </label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles adicionales..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50 text-xs resize-none" />
          </div>

          {/* TASK FIELDS */}
          {type === 'task' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Categoría</label>
                <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="soporte">Soporte</option><option value="infraestructura">Infraestructura</option><option value="desarrollo">Desarrollo</option><option value="seguridad">Seguridad</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Prioridad</label>
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Vencimiento</label>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>
          )}

          {/* INCIDENT FIELDS */}
          {type === 'incident' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Categoría</label>
                <select value={incCategory} onChange={(e) => setIncCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="software">Software</option><option value="hardware">Hardware</option><option value="red">Red / Internet</option><option value="seguridad">Seguridad</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Impacto</label>
                <select value={incImpact} onChange={(e) => setIncImpact(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="baja">Bajo</option><option value="media">Medio</option><option value="alta">Alto</option><option value="critica">Crítico</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Urgencia</label>
                <select value={incUrgency} onChange={(e) => setIncUrgency(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha SLA</label>
                <input type="date" value={incSlaDate} onChange={(e) => setIncSlaDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>
          )}

          {/* MEETING FIELDS */}
          {type === 'meeting' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Inicio</label>
                <input type="datetime-local" value={meetStartTime} onChange={(e) => setMeetStartTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fin</label>
                <input type="datetime-local" value={meetEndTime} onChange={(e) => setMeetEndTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Modalidad</label>
                <select value={meetModality} onChange={(e) => setMeetModality(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="presencial">Presencial</option><option value="remota">Remota</option><option value="hibrida">Híbrida</option>
                </select>
              </div>
            </div>
          )}

          {/* PROJECT FIELDS */}
          {type === 'project' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Prioridad</label>
                <select value={projPriority} onChange={(e) => setProjPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                  <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha Inicio</label>
                <input type="date" value={projStartDate} onChange={(e) => setProjStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha Fin Estimada</label>
                <input type="date" value={projTargetDate} onChange={(e) => setProjTargetDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

