import React from 'react';
import { PhoneCall, Shield, Flame, Wrench, Siren } from 'lucide-react';

export const EmergencyDialer: React.FC = () => {
  const contacts = [
    {
      name: 'Policía Nacional',
      num: '911',
      badge: '911',
      desc: 'Emergencias y seguridad vial',
      bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      badgeBg: 'bg-rose-600 text-white',
      titleColor: 'text-rose-900',
      descColor: 'text-rose-700',
      icon: Siren,
    },
    {
      name: 'Bomberos Salto',
      num: '104',
      badge: '104',
      desc: 'Incendios y rescate',
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      badgeBg: 'bg-amber-600 text-white',
      titleColor: 'text-amber-900',
      descColor: 'text-amber-700',
      icon: Flame,
    },
    {
      name: 'Seguro B.S.E.',
      num: '1998',
      badge: '1998',
      desc: 'Siniestros y auxilio vial',
      bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-600 text-white',
      titleColor: 'text-blue-900',
      descColor: 'text-blue-700',
      icon: Shield,
    },
    {
      name: 'Taller Central Salto',
      num: '47332715',
      badge: '4733 2715',
      desc: 'Mecánica y guardia técnica',
      bg: 'bg-slate-100 hover:bg-slate-200 border-slate-300',
      iconBg: 'bg-slate-800 text-white',
      badgeBg: 'bg-slate-800 text-white',
      titleColor: 'text-slate-900',
      descColor: 'text-slate-600',
      icon: Wrench,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <PhoneCall className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Llamadas de Emergencia</h3>
          <p className="text-xs text-slate-500">Marcación directa de auxilio y servicios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.num}
              href={`tel:${c.num}`}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${c.bg} transition-colors shadow-xs active:scale-[0.99]`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm leading-tight ${c.titleColor}`}>{c.name}</h4>
                  <p className={`text-xs ${c.descColor} font-medium`}>{c.desc}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${c.badgeBg}`}>
                <PhoneCall className="w-3 h-3" />
                {c.badge}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
