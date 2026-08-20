import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import { MeetingItem } from '../../types';

export const CreateMeetingModal: React.FC = () => {
  const { isCreateMeetingOpen, setIsCreateMeetingOpen, toast } = useApp();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [startTime, setStartTime] = useState(`${new Date().toISOString().split('T')[0]}T10:00`);
  const [endTime, setEndTime] = useState(`${new Date().toISOString().split('T')[0]}T11:00`);
  const [modality, setModality] = useState<'presencial' | 'remota' | 'hibrida'>('remota');

  if (!isCreateMeetingOpen) return null;

  const handleClose = () => {
    setIsCreateMeetingOpen(false);
    setTitle('');
    setObjective('');
    setStartTime(`${new Date().toISOString().split('T')[0]}T10:00`);
    setEndTime(`${new Date().toISOString().split('T')[0]}T11:00`);
    setModality('remota');
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    return `MEET-${year}-${randStr}`;
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
      
      const newMeet: MeetingItem = {
        id,
        title,
        objective,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        participants: [currentUser.displayName],
        modality,
        status: 'programada',
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };
      
      await createDocument('meetings', newMeet);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Programación de Reunión', 'Reuniones', id, title, 'Reunión programada manualmente.');
      
      // CREATE NOTIFICATION
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: currentUser.uid,
        title: 'Nueva Reunión Programada',
        message: `Has sido invitado a la reunión: ${title}`,
        linkModule: 'reuniones',
        linkEntityId: id,
        isRead: false,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };
      await createDocument('notifications', newNotification);

      toast(`Reunión ${id} programada`, 'success');
      
      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar la reunión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Programar Reunión
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Asunto / Título *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Comité Semanal de Tecnología..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-purple-500/50 text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Objetivo de la Reunión</label>
            <textarea rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Orden del día, temas a tratar..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-purple-500/50 text-xs resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Inicio</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fin Estimado</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Modalidad</label>
              <select value={modality} onChange={(e) => setModality(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-purple-500/50">
                <option value="presencial">Presencial</option><option value="remota">Remota</option><option value="hibrida">Híbrida</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-purple-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Programar Reunión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
