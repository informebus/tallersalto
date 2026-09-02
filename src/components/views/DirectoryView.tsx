import React, { useState } from 'react';
import { Users, Search, Phone, ShieldAlert, HeartPulse, CreditCard, User, Edit3, Home } from 'lucide-react';
import { PerfilItem } from '../../types';

interface DirectoryViewProps {
  perfiles: Record<string, PerfilItem>;
  onOpenImage: (src: string) => void;
  onGoToProfile: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  perfiles,
  onOpenImage,
  onGoToProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const profilesList = Object.entries(perfiles || {}).map(([id, item]) => ({ ...(item as PerfilItem), id }));

  const filteredProfiles = profilesList.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
    const funcNum = (p.funcionario || '').toLowerCase();
    const phone = (p.tel || '').toLowerCase();
    return fullName.includes(term) || funcNum.includes(term) || phone.includes(term);
  });

  const getVencimientoStatus = (fechaStr?: string) => {
    if (!fechaStr) return { label: 'Sin cargar', color: 'text-slate-400 bg-slate-100 border-slate-200' };
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return { label: fechaStr, color: 'text-slate-500 bg-slate-100 border-slate-200' };

    const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { label: `Venció (${fechaStr})`, color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold' };
    }
    if (diffDays <= 30) {
      return { label: `Vence pronto (${fechaStr})`, color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
    }
    return { label: `Vigente (${fechaStr})`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                Directorio del Personal
              </h2>
              <p className="text-xs text-slate-500">
                Funcionarios del sector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToProfile}
              className="py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Mi Perfil
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, N° funcionario o teléfono..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map((p) => {
            const saludStatus = getVencimientoStatus(p.vencSalud);
            const libretaStatus = getVencimientoStatus(p.vencLibreta);
            const fullName = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Funcionario';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  {/* Top card with photo */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                    <img
                      src={p.foto || 'https://via.placeholder.com/150?text=SIN+FOTO'}
                      alt={fullName}
                      onClick={() => p.foto && onOpenImage(p.foto)}
                      className="w-14 h-14 aspect-square rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0 cursor-pointer hover:opacity-90 transition shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate leading-snug">{fullName}</h3>
                      {p.funcionario && (
                        <span className="inline-block font-mono font-semibold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200 mt-1">
                          Func. #{p.funcionario}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone & Emergency */}
                  <div className="py-2.5 space-y-1.5 text-xs">
                    {p.tel ? (
                      <a
                        href={`tel:${p.tel}`}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition"
                      >
                        <span className="flex items-center gap-1.5 font-medium text-[11px] text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-blue-600" /> Celular:
                        </span>
                        <span className="font-bold text-slate-900 font-mono">{p.tel}</span>
                      </a>
                    ) : (
                      <div className="text-[11px] text-slate-400 px-1">Sin teléfono registrado</div>
                    )}

                    {p.emergencia && (
                      <a
                        href={`tel:${p.emergencia}`}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-rose-900 transition"
                      >
                        <span className="flex items-center gap-1.5 font-semibold text-[11px] text-rose-700">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Emergencia:
                        </span>
                        <span className="font-bold font-mono">{p.emergencia}</span>
                      </a>
                    )}

                    {p.domicilio && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 px-1">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.domicilio}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiration badges footer */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-emerald-600" /> C. Salud:
                    </span>
                    <span className={`px-2 py-0.2 rounded-full border ${saludStatus.color}`}>
                      {saludStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-blue-600" /> Libreta:
                    </span>
                    <span className={`px-2 py-0.2 rounded-full border ${libretaStatus.color}`}>
                      {libretaStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No se encontraron compañeros con los criterios ingresados.
          </div>
        )}
      </div>
    </div>
  );
};
