import React, { useState } from 'react';
import { Server, Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, loading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const fillCredentials = (role: 'admin' | 'analyst') => {
    if (role === 'admin') {
      setEmail('admin@portal-it.com');
      setPassword('Admin@2026!');
    } else {
      setEmail('analista@portal-it.com');
      setPassword('Analista@2026!');
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.07) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.05) 0%, transparent 45%)',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-xl shadow-cyan-500/25 mb-5">
            <Server size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Portal IT / Sistemas</h1>
          <p className="text-slate-500 text-sm mt-1.5">Gestión integral del departamento tecnológico</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-semibold text-slate-300 mb-5 flex items-center gap-2">
            <Shield size={15} className="text-cyan-500" />
            Acceso al sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {authError && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl">
                <AlertCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
                <p className="text-rose-400 text-sm leading-snug">{authError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting || loading || !email || !password}
              className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/25 border-t-slate-950 rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-xs text-slate-600 text-center mb-3 font-medium uppercase tracking-wider">
              Acceso demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-admin-btn"
                type="button"
                onClick={() => fillCredentials('admin')}
                className="group p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-left transition-all duration-150"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">
                  Jefe IT
                </p>
                <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">admin@portal-it.com</p>
              </button>
              <button
                id="demo-analyst-btn"
                type="button"
                onClick={() => fillCredentials('analyst')}
                className="group p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-left transition-all duration-150"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                  Analista IT
                </p>
                <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">analista@portal-it.com</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">
          Portal IT · Uso interno corporativo
        </p>
      </div>
    </div>
  );
};
