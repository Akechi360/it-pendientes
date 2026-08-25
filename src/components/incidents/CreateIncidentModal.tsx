import React, { useState } from 'react';
import { X, LifeBuoy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, sendOneSignalPush } from '../../services/supabaseService';
import { IncidentItem } from '../../types';

export const CreateIncidentModal: React.FC = () => {
  const { isCreateIncidentOpen, setIsCreateIncidentOpen, toast } = useApp();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('software');
  const [impact, setImpact] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [urgency, setUrgency] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [slaDate, setSlaDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isCreateIncidentOpen) return null;

  const handleClose = () => {
    setIsCreateIncidentOpen(false);
    setTitle('');
    setDescription('');
    setCategory('software');
    setImpact('media');
    setUrgency('media');
    setSlaDate(new Date().toISOString().split('T')[0]);
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    return `INC-${year}-${randStr}`;
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
      
      // Calculate Priority based on Impact and Urgency
      const priorityScore = 
        (impact === 'critica' ? 4 : impact === 'alta' ? 3 : impact === 'media' ? 2 : 1) +
        (urgency === 'critica' ? 4 : urgency === 'alta' ? 3 : urgency === 'media' ? 2 : 1);
      const finalPriority = priorityScore >= 7 ? 'critica' : priorityScore >= 5 ? 'alta' : priorityScore >= 3 ? 'media' : 'baja';

      const newInc: IncidentItem = {
        id,
        title,
        description,
        category: category as any,
        impact,
        urgency,
        priority: finalPriority,
        status: 'abierta',
        requester: currentUser.displayName,
        assigneeId: currentUser.uid,
        assigneeName: currentUser.displayName,
        slaDueDate: `${slaDate}T18:00:00`,
        comments: [],
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createDocument('incidents', newInc);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro de Incidencia', 'Incidencias', id, title, 'Incidencia registrada manualmente.');
      
      // CREATE NOTIFICATION
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: currentUser.uid,
        title: 'Nueva Incidencia Asignada',
        message: `Se te ha asignado la incidencia: ${title}`,
        linkModule: 'incidents',
        linkEntityId: id,
        isRead: false,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };
      await createDocument('notifications', newNotification);
      await sendOneSignalPush(newNotification.userId, newNotification.title, newNotification.message);

      toast(`Incidencia ${id} registrada`, 'success');
      
      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar la incidencia', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-amber-400" /> Registrar Incidencia
          </h2>
          <button onClick={handleClose} className="shrink-0 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Asunto / Título *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Caída de red en planta baja..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-amber-500/50 text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Descripción de la Incidencia</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles técnicos, síntomas..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-amber-500/50 text-xs resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-amber-500/50">
                <option value="software">Software</option><option value="hardware">Hardware</option><option value="red">Red / Internet</option><option value="seguridad">Seguridad</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha Compromiso (SLA)</label>
              <input type="date" value={slaDate} onChange={(e) => setSlaDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Impacto</label>
              <select value={impact} onChange={(e) => setImpact(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-amber-500/50">
                <option value="baja">Bajo</option><option value="media">Medio</option><option value="alta">Alto</option><option value="critica">Crítico</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Urgencia</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-amber-500/50">
                <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Registrar Incidencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
