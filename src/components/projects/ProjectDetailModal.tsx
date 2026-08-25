import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  CheckSquare,
  LifeBuoy,
  FileText,
  Users,
  Activity,
  FolderArchive,
  TrendingUp,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { updateDocument, deleteDocument } from '../../services/supabaseService';
import { ProjectItem } from '../../types';

export const ProjectDetailModal: React.FC = () => {
  const { selectedProject, setSelectedProject, tasks, incidents, documents, toast, isDarkTheme } = useApp();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'incidencias' | 'documentos'>('resumen');
  const [progressInput, setProgressInput] = useState<number>(selectedProject?.progress || 0);

  if (!selectedProject) return null;

  const handleClose = () => {
    setSelectedProject(null);
  };

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      await updateDocument('projects', selectedProject.id, { progress: newProgress });
      setSelectedProject({ ...selectedProject, progress: newProgress });
      toast(`Progreso actualizado a ${newProgress}%`, 'success');
    } catch (err) {
      toast('Error al actualizar progreso', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDocument('projects', selectedProject.id);
      toast('Proyecto eliminado', 'success');
      handleClose();
    } catch (err) {
      toast('Error al eliminar proyecto', 'error');
    }
  };

  const linkedTasks = tasks.filter((t) => t.projectId === selectedProject.id || t.projectTitle === selectedProject.name);
  const linkedIncidents = incidents.filter((i) => i.title.includes(selectedProject.name) || i.description.includes(selectedProject.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {selectedProject.id}
            </span>
            <h2 className="text-lg font-bold text-white">{selectedProject.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' && (
              <button onClick={handleDelete} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all" title="Eliminar proyecto">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleClose} className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'resumen' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('tareas')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tareas' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Tareas ({linkedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('incidencias')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'incidencias' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" /> Incidencias ({linkedIncidents.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Progress Slider */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Progreso del Proyecto:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{selectedProject.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => handleUpdateProgress(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800"
                />
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción del Proyecto</h3>
                <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800">
                  {selectedProject.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Líder de Proyecto</span>
                  <strong className="text-slate-200 font-medium">{selectedProject.leadName}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Fecha Inicio</span>
                  <strong className="text-slate-200 font-medium">{selectedProject.startDate}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Fecha Estimada Fin</span>
                  <strong className="text-slate-200 font-medium">{selectedProject.targetDate}</strong>
                </div>
              </div>

              {/* Objectives & Scope */}
              {selectedProject.objectives && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Objetivos</h3>
                  <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-800">{selectedProject.objectives}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tareas' && (
            <div className="space-y-3">
              {linkedTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No hay tareas vinculadas a este proyecto.</p>
              ) : (
                linkedTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold mr-2">{t.id}</span>
                      <span className="text-slate-200 font-semibold">{t.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{t.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'incidencias' && (
            <div className="space-y-3">
              {linkedIncidents.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No hay incidencias asociadas a este proyecto.</p>
              ) : (
                linkedIncidents.map((i) => (
                  <div key={i.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold mr-2">{i.id}</span>
                      <span className="text-slate-200 font-semibold">{i.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">{i.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
