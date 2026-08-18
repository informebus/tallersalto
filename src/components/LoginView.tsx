import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { SaltoLogo } from './SaltoLogo';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, complete su correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Error al autenticar';
      if (errMessage.includes('user-not-found') || errMessage.includes('wrong-password') || errMessage.includes('invalid-credential')) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError(errMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
      >
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0d4e83] p-1 mx-auto mb-3 shadow-md border border-slate-100 flex items-center justify-center">
            <SaltoLogo className="w-full h-full" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            División Ómnibus
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Gestión Operativa de Taller, Tráfico y Choferes
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="conductor@salto.gub.uy"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-[#0d4e83] hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando Sesión...
              </>
            ) : (
              <>
                Ingresar al Sistema
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Database status banner */}
        <div className="mt-5 p-3 bg-slate-900 rounded-xl text-white text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-300">taller-salto-default-rtdb</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-slate-300 font-medium">En línea</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unofficial App Disclaimer Notice */}
      <div className="max-w-md w-full mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="font-bold text-amber-300 block mb-0.5">Aviso Importante:</strong>
          Esta <span className="font-semibold underline underline-offset-2">no es una aplicación oficial</span> de la Intendencia de Salto. Es una herramienta colaborativa de apoyo interno para conductores, talleres y personal de la División Ómnibus.
        </div>
      </div>
    </div>
  );
};

