import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  CheckSquare,
  LifeBuoy,
  Users,
  FolderKanban,
  FileText,
  Server,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useApp, QuickCreateType } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import {
  TaskItem,
  IncidentItem,
  MeetingItem,
  ProjectItem,
  DocumentItem,
  AssetItem,
  RenewalItem
} from '../../types';

export const QuickCreateModal: React.FC = () => {
  const { isQuickCreateOpen, setIsQuickCreateOpen, quickCreateType, toast, isDarkTheme } = useApp();
  const { currentUser } = useAuth();

  const [type, setType] = useState<QuickCreateType>(quickCreateType);
  
  // Generic Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [category, setCategory] = useState('soporte');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [cost, setCost] = useState(0);

  if (!isQuickCreateOpen) return null;

  const handleClose = () => {
    setIsQuickCreateOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('El título es obligatorio', 'warning');
      return;
    }

    try {
      const year = new Date().getFullYear();
      const randStr = Math.floor(1000 + Math.random() * 9000).toString();

      if (type === 'task') {
        const id = `TASK-${year}-${randStr}`;
        const newTask: TaskItem = {
          id,
          title,
          description,
          status: 'pendiente',
          priority,
          category: category as any,
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          creatorId: currentUser.uid,
          creatorName: currentUser.displayName,
          dueDate,
          tags: ['Rápido', category],
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
        toast(`Tarea ${id} creada exitosamente`, 'success');
      } else if (type === 'incident') {
        const id = `INC-${year}-${randStr}`;
        const newInc: IncidentItem = {
          id,
          title,
          description,
          category: category as any,
          impact: priority,
          urgency: priority,
          priority,
          status: 'abierta',
          requester: currentUser.displayName,
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          slaDueDate: `${dueDate}T18:00:00`,
          comments: [],
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('incidents', newInc);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro de Incidencia', 'Incidencias', id, title, 'Incidencia registrada mediante acceso rápido.');
        toast(`Incidencia ${id} registrada exitosamente`, 'success');
      } else if (type === 'meeting') {
        const id = `MEET-${year}-${randStr}`;
        const newMeet: MeetingItem = {
          id,
          title,
          objective: description,
          startTime: `${dueDate}T10:00`,
          endTime: `${dueDate}T11:00`,
          participants: [currentUser.displayName],
          modality: 'presencial',
          status: 'programada',
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('meetings', newMeet);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Programación de Reunión', 'Reuniones', id, title, 'Reunión programada mediante acceso rápido.');
        toast(`Reunión ${id} programada`, 'success');
      } else if (type === 'project') {
        const id = `PROJ-${year}-${randStr}`;
        const newProj: ProjectItem = {
          id,
          name: title,
          description,
          status: 'planificacion',
          priority,
          leadId: currentUser.uid,
          leadName: currentUser.displayName,
          participants: [currentUser.displayName],
          progress: 0,
          startDate: new Date().toISOString().split('T')[0],
          targetDate: dueDate,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('projects', newProj);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Proyecto', 'Proyectos', id, title, 'Proyecto iniciado mediante acceso rápido.');
        toast(`Proyecto ${id} creado`, 'success');
      } else if (type === 'renewal') {
        const id = `REN-${year}-${randStr}`;
        const newRen: RenewalItem = {
          id,
          title,
          type: 'dominio',
          vendor: vendor || 'Proveedor General',
          status: 'proximo_a_renovar',
          cost: cost || 100,
          renewalDate: dueDate,
          frequency: 'anual',
          responsibleId: currentUser.uid,
          responsibleName: currentUser.displayName,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('renewals', newRen);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro de Renovación', 'Renovaciones', id, title, 'Registro de renovación creado mediante acceso rápido.');
        toast(`Renovación ${id} registrada`, 'success');
      }

      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar el registro', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 overflow-hidden transition-all ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" /> Nuevo Registro Rápido
          </h2>
          <button onClick={handleClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Type Selector */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1 transition-all ${
              type === 'task'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Tarea
          </button>
          <button
            type="button"
            onClick={() => setType('incident')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1 transition-all ${
              type === 'incident'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LifeBuoy className="w-4 h-4" /> Incidencia
          </button>
          <button
            type="button"
            onClick={() => setType('meeting')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1 transition-all ${
              type === 'meeting'
                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Reunión
          </button>
          <button
            type="button"
            onClick={() => setType('project')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1 transition-all ${
              type === 'project'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> Proyecto
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Título / Asunto *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Reemplazar disco duro en Servidor BD01..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción / Notas</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales o requerimientos..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Límite / Fecha Evento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
