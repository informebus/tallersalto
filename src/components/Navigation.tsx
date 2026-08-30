import React from 'react';
import { 
  LayoutDashboard, 
  Bus, 
  Clock, 
  Users, 
  Wrench,
  Package,
  ArrowLeftRight
} from 'lucide-react';
import { SectionTab } from '../types';

interface NavigationProps {
  currentTab: SectionTab;
  onSelectTab: (tab: SectionTab) => void;
  pendingCount?: number;
  auxiliosCount?: number;
  cambiosCount?: number;
  objetosCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  auxiliosCount = 0,
  cambiosCount = 0,
  objetosCount = 0,
}) => {
  const tabs = [
    { id: 'tablero' as SectionTab, label: 'Inicio', icon: LayoutDashboard },
    { id: 'conductores' as SectionTab, label: 'Conductores', icon: Bus },
    { 
      id: 'cambios_turno' as SectionTab, 
      label: 'Turnos', 
      icon: ArrowLeftRight,
      badge: cambiosCount > 0 ? `${cambiosCount}` : undefined,
      badgeColor: 'bg-indigo-500 text-white',
    },
    { 
      id: 'objetos_perdidos' as SectionTab, 
      label: 'Objetos', 
      icon: Package,
      badge: objetosCount > 0 ? `${objetosCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { id: 'horarios' as SectionTab, label: 'Horarios', icon: Clock },
    { id: 'directorio' as SectionTab, label: 'Directorio', icon: Users },
    { 
      id: 'taller' as SectionTab, 
      label: 'Taller', 
      icon: Wrench,
      badge: auxiliosCount > 0 ? `${auxiliosCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <>
      {/* Top Desktop/Tablet Navigation Bar */}
      <nav className="hidden md:flex items-center justify-center p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg max-w-4xl mx-auto mb-6 backdrop-blur-md">
        <div className="flex items-center gap-1.5 w-full justify-between overflow-x-auto py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id || (tab.id === 'directorio' && currentTab === 'perfil');
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 py-2 px-3 rounded-xl font-medium text-xs transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-sm ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-1 py-1.5 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto overflow-x-auto gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id || (tab.id === 'directorio' && currentTab === 'perfil');
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'text-blue-400 font-semibold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4.5 h-4.5" />
                  {tab.badge && (
                    <span className={`absolute -top-1.5 -right-2.5 text-[9px] px-1 rounded-full font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

