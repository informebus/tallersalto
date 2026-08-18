import React from 'react';
import { 
  LayoutDashboard, 
  Bus, 
  Clock, 
  Users, 
  Wrench 
} from 'lucide-react';
import { SectionTab } from '../types';

interface NavigationProps {
  currentTab: SectionTab;
  onSelectTab: (tab: SectionTab) => void;
  pendingCount?: number;
  auxiliosCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  auxiliosCount = 0,
}) => {
  const tabs = [
    { id: 'tablero' as SectionTab, label: 'Inicio', icon: LayoutDashboard },
    { id: 'conductores' as SectionTab, label: 'Conductores', icon: Bus },
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
      <nav className="hidden md:flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-1.5 w-full justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id || (tab.id === 'directorio' && currentTab === 'perfil');
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 py-2 px-3.5 rounded-xl font-medium text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-2 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id || (tab.id === 'directorio' && currentTab === 'perfil');
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-blue-600 font-semibold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && (
                    <span className={`absolute -top-1.5 -right-2 text-[9px] px-1 rounded-full font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

