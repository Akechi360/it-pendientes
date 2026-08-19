import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck, ArrowRight, Activity, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export const LoginPage: React.FC = () => {
  const { signIn, loading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen bg-canvas font-sans overflow-hidden">

      {/* Left Side: Branding / Animated Mesh */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-slate-950 border-r border-white/5 overflow-hidden">

        {/* Animated gradient blobs */}
        <motion.div
          className="absolute -top-40 -left-24 w-[36rem] h-[36rem] rounded-full bg-cyan-500/20 blur-[130px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-blue-600/20 blur-[130px]"
          animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px]"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black 40%, transparent 100%)',
          }}
        />

        {/* Grain texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none" />

        {/* Vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-3 text-content-primary">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_-4px] shadow-cyan-500/40">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-bold tracking-tight text-xl text-white">Portal IT</span>
          </div>
        </motion.div>

        {/* Headline + floating stat cards */}
        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            IT Operations <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Command Center</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-content-secondary text-lg leading-relaxed"
          >
            Gestión centralizada de infraestructura, incidencias operativas y proyectos estratégicos del departamento de tecnología.
          </motion.p>

          {/* Floating glass stat cards */}
          <div className="mt-10 flex gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ opacity: { duration: 0.6, delay: 0.35 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 } }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-white text-sm font-bold leading-none">99.98%</div>
                <div className="text-content-muted text-[11px] mt-1">Uptime mensual</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ opacity: { duration: 0.6, delay: 0.45 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 } }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-white text-sm font-bold leading-none">24/7</div>
                <div className="text-content-muted text-[11px] mt-1">Monitoreo activo</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex items-center gap-4 text-xs font-mono text-content-muted"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Sistemas Operativos
            </div>
            <div className="w-1 h-1 rounded-full bg-border-subtle"></div>
            <div>Acceso Seguro Requiere Autorización</div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">

        {/* Ambient glow behind card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[110px]" />
          <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] rounded-full bg-blue-500/5 blur-[110px]" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md relative z-10 rounded-3xl border border-border-subtle bg-surface/70 backdrop-blur-xl shadow-2xl shadow-black/5 p-8 sm:p-10"
        >

          {/* Mobile Header (Hidden on Desktop) */}
          <motion.div variants={itemVariants} className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5">
              <Server size={26} className="text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">Portal IT</h1>
            <p className="text-content-secondary text-sm mt-1.5">Centro de Operaciones</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-content-primary mb-2">Iniciar sesión</h2>
            <p className="text-content-secondary text-sm">
              Introduce tus credenciales corporativas para acceder.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label htmlFor="login-email" className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-cyan-500 transition-colors duration-300 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-content-primary placeholder-content-muted text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/60 transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[10px] font-bold text-content-muted uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-cyan-500 transition-colors duration-300 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-muted text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/60 transition-all duration-300"
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
            </motion.div>

            {/* Remember me */}
            <motion.div variants={itemVariants} className="flex items-center">
              <label htmlFor="login-remember" className="inline-flex items-center gap-2 text-xs text-content-secondary cursor-pointer select-none">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border-subtle accent-cyan-500 cursor-pointer"
                />
                Mantener sesión iniciada
              </label>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-rose-400 text-sm leading-snug font-medium">{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <motion.button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting || loading || !email || !password}
                whileHover={{ scale: isSubmitting || loading || !email || !password ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting || loading || !email || !password ? 1 : 0.98 }}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-cyan-500/20 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    Iniciar Sesión <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center text-content-muted text-[11px] mt-8 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} />
            Protegido por Supabase Auth
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
