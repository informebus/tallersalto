import React, { useState } from 'react';
import { Lock, X, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PinPromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  expectedPin?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinPromptModal: React.FC<PinPromptModalProps> = ({
  isOpen,
  title,
  description = 'Ingrese la clave de seguridad autorizada para continuar.',
  expectedPin,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!expectedPin || pin === expectedPin) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPin('');
                setError(false);
                onCancel();
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="••••"
                className={`w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-mono rounded-xl bg-slate-50 border ${
                  error
                    ? 'border-rose-500 text-rose-600 focus:ring-rose-500/20'
                    : 'border-slate-300 text-blue-600 focus:border-blue-600 focus:ring-blue-500/20'
                } focus:outline-none focus:ring-2 transition`}
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-rose-700 text-xs justify-center font-medium bg-rose-50 py-2 px-3 rounded-lg border border-rose-200"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Clave incorrecta. Acceso no autorizado.
              </motion.div>
            )}

            {/* Quick keypad for mobile */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('');
                    else if (k === '⌫') handleDelete();
                    else handleDigit(k);
                  }}
                  className="py-3 text-lg font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white text-slate-800 transition active:scale-95 flex items-center justify-center border border-slate-200"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setError(false);
                  onCancel();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Verificar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
