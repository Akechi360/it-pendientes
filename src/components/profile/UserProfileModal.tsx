import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Save, Shield, Mail, Briefcase, Camera, Users, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { upsertUserProfile, createDocument } from '../../services/supabaseService';
import { Avatar } from '../shared/Avatar';

export const UserProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, toast } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
  
  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New User State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newUserLoading, setNewUserLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isProfileOpen) {
      setDisplayName(currentUser.displayName);
      setTitle(currentUser.title || '');
      setPhotoURL(currentUser.photoURL || null);
      setActiveTab('profile');
    }
  }, [currentUser, isProfileOpen]);

  if (!currentUser) return null;

  const handleClose = () => setIsProfileOpen(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
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
        photoURL,
        updatedAt: new Date().toISOString()
      };
      
      await upsertUserProfile(updatedProfile);
      
      currentUser.displayName = displayName;
      currentUser.title = title;
      currentUser.photoURL = photoURL;

      toast('Perfil actualizado exitosamente', 'success');
      // No cerramos el modal por si quiere seguir navegando
    } catch (err) {
      console.error(err);
      toast('Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) {
      toast('Todos los campos son obligatorios', 'warning');
      return;
    }
    setNewUserLoading(true);
    try {
      // Import the sign up function
      const { supabase } = await import('../../lib/supabase');
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Record in public.users as 'analyst'
      const newUid = data.user?.id || `TEMP-${Date.now()}`;
      await upsertUserProfile({
        uid: newUid,
        email: newEmail,
        displayName: newName,
        role: 'analyst',
        title: 'Analista IT',
        organizationId: currentUser.organizationId
      });

      toast('Analista IT creado exitosamente', 'success');
      setNewEmail('');
      setNewPassword('');
      setNewName('');
    } catch (err: any) {
      toast('Error al crear usuario: ' + err.message, 'error');
    } finally {
      setNewUserLoading(false);
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
            className="w-full max-w-lg rounded-3xl shadow-2xl border bg-surface/95 backdrop-blur-xl border-border-subtle overflow-hidden text-content-primary flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-border-subtle shrink-0">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" /> Preferencias y Configuración
                </h2>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-4 px-6">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-content-muted hover:text-content-primary'}`}
                  >
                    Mi Perfil
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'users' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-content-muted hover:text-content-primary'}`}
                  >
                    <Users size={16} /> Gestión de Analistas
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
              
              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Avatar name={displayName || currentUser.displayName} photoURL={photoURL} size="xl" ring />
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden"
                      />
                    </div>
                    
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

                  <div className="pt-4 border-t border-border-subtle mt-6">
                    <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2">Notificaciones Push</label>
                    <button
                      type="button"
                      onClick={() => {
                        if ('Notification' in window) {
                          Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                              toast('Permiso concedido. Las notificaciones Push están activas.', 'success');
                            } else {
                              toast('Permiso denegado por el navegador/sistema.', 'error');
                            }
                          });
                        } else {
                          toast('Este navegador no soporta notificaciones', 'error');
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border-subtle bg-surface-raised hover:bg-surface-hover transition-all"
                    >
                      <div className="flex items-center gap-2 text-content-primary">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold">Activar notificaciones en este dispositivo</span>
                      </div>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-500/20">Permitir</span>
                    </button>
                    <p className="text-[10px] text-content-secondary mt-2 leading-relaxed">
                      Si usas tu teléfono o celular, debes usar este botón para darle permiso explícito a la aplicación para que te envíe alertas al sistema.
                    </p>
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
              )}

              {/* TAB: USERS (ADMIN ONLY) */}
              {activeTab === 'users' && isAdmin && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-border-subtle bg-canvas text-sm text-content-secondary">
                    Registra nuevos analistas para que tengan acceso al sistema. Los analistas no pueden ver proyectos estratégicos ni registros de auditoría.
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-4 p-5 rounded-2xl bg-surface-raised border border-border-subtle">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                      <Plus size={14} /> Registrar Nuevo Analista IT
                    </h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/60 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="analista@empresa.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/60 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Contraseña Temporal</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 caracteres"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/60 text-sm"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={newUserLoading || !newEmail || !newPassword || !newName}
                        className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {newUserLoading ? 'Registrando...' : 'Crear Usuario'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
