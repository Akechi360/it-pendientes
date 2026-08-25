import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  Tag,
  Plus,
  Trash2,
  MessageSquare,
  Lock,
  Unlock,
  Copy,
  LifeBuoy,
  Archive,
  Star,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { updateDocument, deleteDocument, logActivity, createDocument } from '../../services/supabaseService';
import { TaskItem, TaskStatus, PriorityLevel, ChecklistItem, IncidentItem } from '../../types';

export const TaskDetailModal: React.FC = () => {
  const { selectedTask, setSelectedTask, toast, projects, isDarkTheme } = useApp();
  const { currentUser } = useAuth();

  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  if (!selectedTask) return null;

  const handleClose = () => {
    setSelectedTask(null);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateDocument('tasks', selectedTask.id, {
        status: newStatus,
        isBlocked: newStatus === 'bloqueada' ? selectedTask.isBlocked : false
      });
      await logActivity(
        currentUser.uid,
        currentUser.displayName,
        currentUser.role,
        'Cambio de Estado de Tarea',
        'Tareas',
        selectedTask.id,
        selectedTask.title,
        `Estado cambiado a ${newStatus}`
      );
      setSelectedTask({ ...selectedTask, status: newStatus });
      toast(`Estado actualizado a ${newStatus}`, 'success');
    } catch (err) {
      toast('Error al actualizar estado', 'error');
    }
  };

  const handleToggleFocus = async () => {
    const nextFocused = !selectedTask.isFocused;
    try {
      await updateDocument('tasks', selectedTask.id, { isFocused: nextFocused });
      setSelectedTask({ ...selectedTask, isFocused: nextFocused });
      toast(nextFocused ? 'Tarea agregada a En Foco Hoy' : 'Tarea removida de En Foco', 'info');
    } catch (err) {
      toast('Error al cambiar estado de foco', 'error');
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: 'chk_' + Date.now(),
      title: newChecklistTitle.trim(),
      completed: false
    };

    const updatedList = [...(selectedTask.checklist || []), newItem];
    try {
      await updateDocument('tasks', selectedTask.id, { checklist: updatedList });
      setSelectedTask({ ...selectedTask, checklist: updatedList });
      setNewChecklistTitle('');
    } catch (err) {
      toast('Error al agregar ítem de checklist', 'error');
    }
  };

  const handleToggleChecklist = async (id: string) => {
    const updatedList = selectedTask.checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateDocument('tasks', selectedTask.id, { checklist: updatedList });
      setSelectedTask({ ...selectedTask, checklist: updatedList });
    } catch (err) {
      toast('Error al actualizar checklist', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: 'cm_' + Date.now(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(selectedTask.comments || []), newComment];
    try {
      await updateDocument('tasks', selectedTask.id, { comments: updatedComments });
      setSelectedTask({ ...selectedTask, comments: updatedComments });
      setNewCommentText('');
      toast('Comentario publicado', 'success');
    } catch (err) {
      toast('Error al publicar comentario', 'error');
    }
  };

  const handleBlockToggle = async () => {
    if (!selectedTask.isBlocked) {
      if (!blockReasonInput.trim()) {
        toast('Debes proporcionar un motivo de bloqueo', 'warning');
        return;
      }
      try {
        await updateDocument('tasks', selectedTask.id, {
          isBlocked: true,
          status: 'bloqueada',
          blockReason: blockReasonInput.trim(),
          blockedBy: currentUser.displayName
        });
        setSelectedTask({
          ...selectedTask,
          isBlocked: true,
          status: 'bloqueada',
          blockReason: blockReasonInput.trim(),
          blockedBy: currentUser.displayName
        });
        setIsBlocking(false);
        setBlockReasonInput('');
        toast('Tarea marcada como bloqueada', 'warning');
      } catch (err) {
        toast('Error al bloquear tarea', 'error');
      }
    } else {
      try {
        await updateDocument('tasks', selectedTask.id, {
          isBlocked: false,
          status: 'en_progreso',
          blockReason: '',
          blockedBy: ''
        });
        setSelectedTask({
          ...selectedTask,
          isBlocked: false,
          status: 'en_progreso',
          blockReason: '',
          blockedBy: ''
        });
        toast('Tarea desbloqueada', 'success');
      } catch (err) {
        toast('Error al desbloquear tarea', 'error');
      }
    }
  };

  const handleDuplicate = async () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const newId = `TASK-${year}-${randStr}`;

    const newTask: TaskItem = {
      ...selectedTask,
      id: newId,
      title: `${selectedTask.title} (Copia)`,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('tasks', newTask);
      toast(`Tarea duplicada como ${newId}`, 'success');
      setSelectedTask(newTask);
    } catch (err) {
      toast('Error al duplicar tarea', 'error');
    }
  };

  const handleConvertToIncident = async () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const newIncId = `INC-${year}-${randStr}`;

    const newInc: IncidentItem = {
      id: newIncId,
      title: selectedTask.title,
      description: selectedTask.description,
      category: (selectedTask.category as any) || 'otro',
      impact: selectedTask.priority,
      urgency: selectedTask.priority,
      priority: selectedTask.priority,
      status: 'abierta',
      requester: selectedTask.creatorName,
      assigneeId: selectedTask.assigneeId,
      assigneeName: selectedTask.assigneeName,
      slaDueDate: `${selectedTask.dueDate}T18:00:00`,
      comments: selectedTask.comments,
      organizationId: selectedTask.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('incidents', newInc);
      await updateDocument('tasks', selectedTask.id, {
        status: 'cancelada',
        description: `${selectedTask.description}\n\n* Convertida a Incidencia ${newIncId} *`
      });
      toast(`Tarea convertida en Incidencia ${newIncId}`, 'success');
      handleClose();
    } catch (err) {
      toast('Error al convertir en incidencia', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDocument('tasks', selectedTask.id);
      toast('Tarea eliminada', 'success');
      handleClose();
    } catch (err) {
      toast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden transition-all flex flex-col max-h-[90vh] ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              {selectedTask.id}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded uppercase font-mono ${
              selectedTask.priority === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              selectedTask.priority === 'alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {selectedTask.priority}
            </span>
            <button
              onClick={handleToggleFocus}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                selectedTask.isFocused
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              {selectedTask.isFocused ? 'En Foco' : 'Marcar en Foco'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDuplicate}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
              title="Duplicar tarea"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleConvertToIncident}
              className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
              title="Convertir a Incidencia"
            >
              <LifeBuoy className="w-4 h-4" />
            </button>
            <button onClick={handleClose} className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Status Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Estado de la Tarea:</span>
            <div className="flex flex-wrap gap-1">
              {(['pendiente', 'en_progreso', 'bloqueada', 'en_revision', 'completada', 'cancelada'] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono capitalize transition-all ${
                    selectedTask.status === st
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Block Warning Box if Blocked */}
          {selectedTask.isBlocked && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong className="font-bold text-rose-200 block mb-1">Tarea Bloqueada por {selectedTask.blockedBy || 'Operador'}</strong>
                <p>{selectedTask.blockReason}</p>
                <button
                  onClick={handleBlockToggle}
                  className="mt-2 px-3 py-1 rounded bg-rose-500 text-slate-950 font-bold text-[11px]"
                >
                  Desbloquear Tarea
                </button>
              </div>
            </div>
          )}

          {/* Title and Meta info */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">{selectedTask.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Responsable</span>
                <strong className="text-slate-200 font-medium">{selectedTask.assigneeName}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Categoría</span>
                <strong className="text-slate-200 font-medium capitalize">{selectedTask.category}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Fecha Límite</span>
                <strong className="text-slate-200 font-medium">{selectedTask.dueDate}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Recurrencia</span>
                <strong className="text-slate-200 font-medium capitalize">{selectedTask.recurrence || 'Única'}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción & Procedimiento</h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-sm leading-relaxed text-slate-300 whitespace-pre-line font-mono">
              {selectedTask.description || 'Sin descripción provista.'}
            </div>
          </div>

          {/* Checklist Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" /> Checklist de Subtareas
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {selectedTask.checklist?.filter((c) => c.completed).length || 0} / {selectedTask.checklist?.length || 0}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {selectedTask.checklist?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                  />
                  <span className={`text-slate-200 ${item.completed ? 'line-through text-slate-500' : ''}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChecklistItem} className="flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Agregar nuevo paso al checklist..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                + Agregar
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Comentarios & Notas Técnicas
            </h3>

            <div className="space-y-3 mb-4">
              {selectedTask.comments?.map((cm) => (
                <div key={cm.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-cyan-400 font-semibold">{cm.authorName}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(cm.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{cm.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={2}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escribe una observación técnica o avance..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Comentar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
