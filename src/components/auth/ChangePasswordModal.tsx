import React, { useState } from 'react';
import { KeyRound, X, Check, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword, currentUser } = useAuth();
  const { toast } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(newPassword);
    setIsSubmitting(false);

    if (result.success) {
      toast('Contraseña actualizada exitosamente', 'success');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al cambiar la contraseña.');
    }
  };

  const isLengthOk = newPassword.length >= 8;
  const isMatchOk = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle text-content-primary overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Cambiar Contraseña</h2>
              <p className="text-content-muted text-xs">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-raised border border-border-subtle text-content-primary text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs space-y-1.5">
            <div className={`flex items-center gap-2 ${isLengthOk ? 'text-emerald-400' : 'text-content-muted'}`}>
              <Check size={14} className={isLengthOk ? 'opacity-100' : 'opacity-40'} />
              <span>Al menos 8 caracteres</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatchOk ? 'text-emerald-400' : 'text-content-muted'}`}>
              <Check size={14} className={isMatchOk ? 'opacity-100' : 'opacity-40'} />
              <span>Las contraseñas coinciden</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-semibold text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isLengthOk || !isMatchOk}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Actualizar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
