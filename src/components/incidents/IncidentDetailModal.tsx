import React, { useState } from 'react';
import {
  X,
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  User,
  ShieldAlert,
  CheckSquare,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { updateDocument, createDocument, deleteDocument, logActivity } from '../../services/supabaseService';
import { IncidentStatus, TaskItem } from '../../types';

export const IncidentDetailModal: React.FC = () => {
  const { selectedIncident, setSelectedIncident, toast, isDarkTheme } = useApp();
  const { currentUser } = useAuth();

  const [diagnosis, setDiagnosis] = useState(selectedIncident?.diagnosis || '');
  const [solution, setSolution] = useState(selectedIncident?.solution || '');
  const [rootCause, setRootCause] = useState(selectedIncident?.rootCause || '');
  const [newComment, setNewComment] = useState('');

  if (!selectedIncident) return null;

  const handleClose = () => {
    setSelectedIncident(null);
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await updateDocument('incidents', selectedIncident.id, {
        status: newStatus,
        diagnosis,
        solution,
        rootCause
      });
      await logActivity(
        currentUser.uid,
        currentUser.displayName,
        currentUser.role,
        'Actualización de Incidencia',
        'Incidencias',
        selectedIncident.id,
        selectedIncident.title,
        `Estado actualizado a ${newStatus}`
      );
      setSelectedIncident({ ...selectedIncident, status: newStatus, diagnosis, solution, rootCause });
      toast(`Incidencia actualizada a ${newStatus}`, 'success');
    } catch (err) {
      toast('Error al actualizar incidencia', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: 'cm_inc_' + Date.now(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(selectedIncident.comments || []), commentObj];
    
    try {
      await updateDocument('incidents', selectedIncident.id, { comments: updatedComments });
      setSelectedIncident({ ...selectedIncident, comments: updatedComments });
      setNewComment('');
      toast('Observación técnica agregada', 'success');
    } catch (err) {
      toast('Error al comentar', 'error');
    }
  };

  const handleConvertToTask = async () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const taskId = `TSK-${year}-${randStr}`;

    const newTask: TaskItem = {
      id: taskId,
      title: `[Resolver Incidencia ${selectedIncident.id}] ${selectedIncident.title}`,
      description: `Derivado de Incidencia ${selectedIncident.id}:\n${selectedIncident.description}`,
      priority: selectedIncident.priority,
      status: 'pendiente',
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName,
      assigneeId: selectedIncident.assigneeId,
      assigneeName: selectedIncident.assigneeName,
      category: 'soporte',
      dueDate: selectedIncident.slaDueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      checklist: [],
      comments: selectedIncident.comments,
      tags: ['Incidencia', selectedIncident.id],
      isBlocked: false,
      isFocused: false,
      isArchived: false,
      organizationId: selectedIncident.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('tasks', newTask);
      await updateDocument('incidents', selectedIncident.id, { status: 'en_progreso' });
      
      // CREATE NOTIFICATION
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: selectedIncident.assigneeId === 'unassigned' ? currentUser.uid : selectedIncident.assigneeId,
        title: 'Nueva Tarea Asignada (Desde Incidencia)',
        message: `Se te ha asignado la tarea: ${newTask.title}`,
        linkModule: 'tasks',
        linkEntityId: taskId,
        isRead: false,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };
      await createDocument('notifications', newNotification);

      toast(`Incidencia convertida en Tarea ${taskId}`, 'success');
      handleClose();
    } catch (err) {
      toast('Error al convertir a tarea', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta incidencia? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDocument('incidents', selectedIncident.id);
      toast('Incidencia eliminada', 'success');
      handleClose();
    } catch (err) {
      toast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {selectedIncident.id}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded uppercase font-mono ${
              selectedIncident.priority === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {selectedIncident.priority}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' && (
              <button onClick={handleDelete} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all" title="Eliminar incidencia">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleConvertToTask}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Convertir a Tarea
            </button>
            <button onClick={handleClose} className="p-2 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Status Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Estado del Ticket:</span>
            <div className="flex flex-wrap gap-1">
              {(['abierta', 'en_progreso', 'esperando_proveedor', 'resuelta', 'cerrada'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono capitalize transition-all ${
                    selectedIncident.status === st
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">{selectedIncident.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Solicitante</span>
                <strong className="text-slate-200 font-medium">{selectedIncident.requester}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Asignado</span>
                <strong className="text-slate-200 font-medium">{selectedIncident.assigneeName}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">Categoría</span>
                <strong className="text-slate-200 font-medium capitalize">{selectedIncident.category}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-mono">SLA Límite</span>
                <strong className="text-amber-400 font-mono font-medium">{selectedIncident.slaDueDate}</strong>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción del Problema</h3>
            <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800">
              {selectedIncident.description}
            </p>
          </div>

          {/* Diagnostic & Solution Fields */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Diagnóstico Técnico</label>
              <textarea
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Explicación del hallazgo técnico..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Solución Aplicada</label>
              <textarea
                rows={2}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Acciones correctivas realizadas..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> Bitácora de Atención
            </h3>
            <div className="space-y-2 mb-3">
              {selectedIncident.comments?.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <strong className="text-amber-400">{c.authorName}</strong>
                    <span className="font-mono text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300">{c.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribir avance o nota interna..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                Comentar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
