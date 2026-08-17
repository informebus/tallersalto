import React, { useState, useRef } from 'react';
import { LogOut, ShieldAlert, AlertCircle } from 'lucide-react';
import firebase from '../firebase';
import { SaltoLogo } from './SaltoLogo';

interface HeaderProps {
  user: firebase.User | null;
  onOpenMinigame: () => void;
  onOpenProfile: () => void;
  onOpenBreakdown: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenMinigame,
  onOpenProfile,
  onOpenBreakdown,
  onLogout,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (tapTimer.current) clearTimeout(tapTimer.current);

      if (next >= 3) {
        onOpenMinigame();
        return 0;
      }

      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 900);

      return next;
    });
  };

  const username = user?.email ? user.email.split('@')[0] : 'Conductor';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Secret Easter Egg Trigger */}
        <div className="flex items-center gap-3">
          <div 
            className="relative group cursor-pointer" 
            onClick={handleLogoTap}
            title="Toca 3 veces para el minijuego de descanso"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#0d4e83] p-0.5 shadow-sm transition transform active:scale-90 hover:brightness-110">
              <SaltoLogo className="w-full h-full" />
            </div>

            {/* Subtle Easter Egg Counter Indicator */}
            {tapCount > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-ping">
                {tapCount}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                División Ómnibus
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Salto
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gestión Operativa • App de Personal
            </p>
          </div>
        </div>

        {/* User Actions */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBreakdown}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 animate-pulse"
              title="Reportar Auxilio Mecánico Inmediato"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">SOS</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">{username}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Acceso seguro
          </div>
        )}
      </div>
    </header>
  );
};
