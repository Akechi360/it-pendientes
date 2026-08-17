import React, { useState } from 'react';
import { Server, Eye, EyeOff, Lock, Mail, AlertCircle, Shield, ArrowRight } from 'lucide-react';
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

  return (
    <div className="flex min-h-screen bg-canvas font-sans overflow-hidden">
      
      {/* Left Side: Branding / Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-slate-950 border-r border-border-subtle overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/2279867.jpg')] bg-cover bg-center opacity-60 scale-105"></div>
        
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-content-primary">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-bold tracking-tight text-xl">Portal IT</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            IT Operations <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Command Center</span>
          </h1>
          <p className="text-content-secondary text-lg leading-relaxed">
            Gestión centralizada de infraestructura, incidencias operativas y proyectos estratégicos del departamento de tecnología.
          </p>
          
          <div className="mt-10 flex items-center gap-4 text-xs font-mono text-content-muted">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Sistemas Operativos
            </div>
            <div className="w-1 h-1 rounded-full bg-border-subtle"></div>
            <div>Acceso Seguro Requiere Autorización</div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-canvas">
        <div className="w-full max-w-md">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5">
              <Server size={26} className="text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">Portal IT</h1>
            <p className="text-content-secondary text-sm mt-1.5">Centro de Operaciones</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-content-primary mb-2">Iniciar sesión</h2>
            <p className="text-content-secondary text-sm mb-4">
              Introduce tus credenciales corporativas para acceder.
            </p>

            {/* Quick Demo Access Pills */}
            <div className="space-y-2 p-3 rounded-xl bg-surface border border-border-subtle">
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Acceso Rápido Demo</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('gerencia_sistemas@clinicaieq.com');
                    setPassword('AdminIT2026!');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border-subtle text-left text-xs transition-colors"
                >
                  <p className="font-semibold text-cyan-400">Gerente IT</p>
                  <p className="text-[10px] text-content-muted truncate">gerencia_sistemas@...</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('sistemas@clinicaieq.com');
                    setPassword('EduardoIT2026!');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border-subtle text-left text-xs transition-colors"
                >
                  <p className="font-semibold text-emerald-400">Eduardo Toro</p>
                  <p className="text-[10px] text-content-muted truncate">sistemas@...</p>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-content-primary placeholder-content-muted text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-muted text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {authError && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                <p className="text-rose-400 text-sm leading-snug font-medium">{authError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting || loading || !email || !password}
              className="w-full mt-4 py-3 rounded-xl bg-content-primary hover:bg-white text-canvas active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  Iniciar Sesión <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-content-muted text-[11px] mt-8 flex items-center justify-center gap-1.5">
            <Shield size={12} />
            Protegido por Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
};
