import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, sendOneSignalPush } from '../../services/supabaseService';
import { useRealtimeQuery } from '../../hooks/useRealtimeQuery';
import { TaskItem } from '../../types';

export const CreateTaskModal: React.FC = () => {
  const { isCreateTaskOpen, setIsCreateTaskOpen, toast } = useApp();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [category, setCategory] = useState('soporte');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [assigneeId, setAssigneeId] = useState(currentUser?.uid || '');

  // Obtener lista de usuarios para poder asignar la tarea a otra persona
  const { data: users } = useRealtimeQuery('users');

  if (!isCreateTaskOpen) return null;

  const handleClose = () => {
    setIsCreateTaskOpen(false);
    setTitle('');
    setDescription('');
    setPriority('media');
    setCategory('soporte');
    setDueDate(new Date().toISOString().split('T')[0]);
    setAssigneeId(currentUser?.uid || '');
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    return `TASK-${year}-${randStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) {
      toast('El título es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      const id = generateId();
      const selectedUser = (users || []).find((u: any) => u.uid === assigneeId) || currentUser;
      
      const newTask: TaskItem = {
        id,
        title,
        description,
        status: 'pendiente',
        priority,
        category: category as any,
        assigneeId: selectedUser.uid,
        assigneeName: selectedUser.display_name || selectedUser.displayName || selectedUser.email,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName,
        dueDate,
        tags: ['Manual', category],
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
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Tarea', 'Tareas', id, title, 'Tarea creada manualmente.');
      
      // CREATE NOTIFICATION
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: selectedUser.uid,
        title: 'Nueva Tarea Asignada',
        message: `Se te ha asignado la tarea: ${title}`,
        linkModule: 'tasks',
        linkEntityId: id,
        isRead: false,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };
      await createDocument('notifications', newNotification);
      await sendOneSignalPush(newNotification.userId, newNotification.title, newNotification.message);

      toast(`Tarea ${id} creada`, 'success');
      
      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar la tarea', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" /> Nueva Tarea
          </h2>
          <button onClick={handleClose} className="shrink-0 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Título de la Tarea *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Actualizar servidor de base de datos..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50 text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Descripción</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50 text-xs resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Asignado a</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                {users && users.map((u: any) => (
                  <option key={u.uid} value={u.uid}>{u.display_name || u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                <option value="soporte">Soporte</option><option value="infraestructura">Infraestructura</option><option value="desarrollo">Desarrollo</option><option value="seguridad">Seguridad</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50">
                <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Vencimiento</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
