import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Save, Shield, Mail, Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { upsertUserProfile } from '../../services/supabaseService';
import { Avatar } from '../shared/Avatar';

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

  if (!currentUser) return null;

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
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md rounded-3xl shadow-2xl border p-6 sm:p-8 bg-surface/95 backdrop-blur-xl border-border-subtle overflow-hidden text-content-primary"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" /> Mi Perfil
              </h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar name={displayName || currentUser.displayName} photoURL={currentUser.photoURL} size="xl" ring />
                <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-surface-raised border border-border-subtle text-content-secondary mt-4">
                  <Shield className="w-3 h-3 text-cyan-400" /> {currentUser.role === 'admin' ? 'Administrador' : 'Analista IT'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/60 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Cargo / Título</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Especialista en Redes"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/60 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border-subtle text-content-muted text-sm cursor-not-allowed">
                  <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{currentUser.email}</span>
                </div>
                <p className="text-[10px] text-content-secondary mt-1">El correo está vinculado a la autenticación centralizada y no puede modificarse.</p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
                >
                  Cerrar
                </button>
                <motion.button
                  whileHover={{ scale: loading || !displayName.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !displayName.trim() ? 1 : 0.97 }}
                  type="submit"
                  disabled={loading || (!displayName.trim())}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
