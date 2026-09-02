import React, { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import firebase, { db } from '../firebase';
import { SaltoLogo } from './SaltoLogo';

interface HeaderProps {
  user: firebase.User | null;
  onOpenMinigame: () => void;
  onOpenProfile: () => void;
  onOpenBreakdown?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenMinigame,
  onOpenProfile,
  onLogout,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [profileData, setProfileData] = useState<{ nombre?: string; apellido?: string; foto?: string } | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileData(null);
      return;
    }

    const ref = db.ref(`perfiles/${user.uid}`);
    const handleValue = (snapshot: firebase.database.DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfileData(data);
      }
    };

    ref.on('value', handleValue);
    return () => {
      ref.off('value', handleValue);
    };
  }, [user]);

  const handleLogoTap = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    const next = tapCount + 1;
    if (next >= 3) {
      setTapCount(0);
      onOpenMinigame();
    } else {
      setTapCount(next);
      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 900);
    }
  };

  const rawFullName = [profileData?.nombre, profileData?.apellido].filter(Boolean).join(' ').trim();
  const displayName = rawFullName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Conductor');
  const initial = displayName.charAt(0).toUpperCase() || 'C';

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
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                División Ómnibus
              </h1>
            </div>
          </div>
        </div>

        {/* User Actions */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 py-1 px-2.5 sm:px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition active:scale-95 text-left"
              title="Ver mi perfil"
            >
              {profileData?.foto ? (
                <img
                  src={profileData.foto}
                  alt={displayName}
                  className="w-6 h-6 rounded-md object-cover border border-blue-300 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                  {initial}
                </div>
              )}
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[10px] text-slate-500 font-medium leading-none">Bienvenido</span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[200px] leading-tight">
                  {displayName}
                </span>
              </div>
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
