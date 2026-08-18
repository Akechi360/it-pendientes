import React, { useState, useEffect } from 'react';
import { X, User, Save, Shield, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { upsertUserProfile } from '../../services/supabaseService';

export const UserProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, toast } = useApp();
  const { currentUser, login } = useAuth(); // We might need to refresh auth context or it will just read from current

  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isProfileOpen) {
      setDisplayName(currentUser.displayName);
      setTitle(currentUser.title || '');
    }
  }, [currentUser, isProfileOpen]);

  if (!isProfileOpen || !currentUser) return null;

  const handleClose = () => {
    setIsProfileOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast('El nombre es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = {
        ...currentUser,
        displayName,
        title,
        updatedAt: new Date().toISOString()
      };
      
      await upsertUserProfile(updatedProfile);
      
      // Update local context manually to reflect immediately 
      // (a real app might have an auth refresh, we just fake it here for UI responsiveness)
      currentUser.displayName = displayName;
      currentUser.title = title;

      toast('Perfil actualizado exitosamente', 'success');
      handleClose();
    } catch (err) {
      console.error(err);
      toast('Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Mi Perfil
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl font-bold border-2 border-cyan-500/30 mb-3">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-surface-raised border border-border-subtle text-content-secondary">
              <Shield className="w-3 h-3" /> {currentUser.role === 'admin' ? 'Administrador' : 'Analista IT'}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Nombre Completo</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/50 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Cargo / Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Especialista en Redes"
              className="w-full px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="flex items-center gap-2 w-full px-3.5 py-2 rounded-lg bg-canvas border border-border-subtle text-content-muted text-sm cursor-not-allowed">
              <Mail className="w-4 h-4" /> {currentUser.email}
            </div>
            <p className="text-[10px] text-content-secondary mt-1">El correo está vinculado a la autenticación centralizada y no puede modificarse.</p>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading || (!displayName.trim())}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
