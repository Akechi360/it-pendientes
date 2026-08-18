import React, { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import { ProjectItem } from '../../types';

export const CreateProjectModal: React.FC = () => {
  const { isCreateProjectOpen, setIsCreateProjectOpen, toast } = useApp();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isCreateProjectOpen) return null;

  const handleClose = () => {
    setIsCreateProjectOpen(false);
    setTitle('');
    setDescription('');
    setPriority('media');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetDate(new Date().toISOString().split('T')[0]);
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    return `PROJ-${year}-${randStr}`;
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
        startDate,
        targetDate,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createDocument('projects', newProj);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Proyecto', 'Proyectos', id, title, 'Proyecto iniciado manualmente.');
      toast(`Proyecto ${id} creado`, 'success');
      
      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al guardar el proyecto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-400" /> Nuevo Proyecto
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Nombre del Proyecto *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Migración a la nube..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500/50 text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Descripción y Objetivos</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles principales del proyecto..." className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500/50 text-xs resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Prioridad Estratégica</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-emerald-500/50">
                <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha de Inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Fecha Fin Estimada</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
