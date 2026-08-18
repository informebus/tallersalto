import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Radio, 
  CloudRain, 
  Trash2, 
  Search, 
  Plus, 
  Send, 
  Clock, 
  MapPin, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../firebase';
import { AuxilioItem, ComunicadoItem, CorteItem, PlanillaItem, TareaItem } from '../../types';
import { EmergencyDialer } from '../EmergencyDialer';

interface DashboardViewProps {
  auxilios: Record<string, AuxilioItem>;
  comunicados: Record<string, ComunicadoItem>;
  cortes: Record<string, CorteItem>;
  tareas: Record<string, TareaItem>;
  planilla: PlanillaItem | null;
  currentUserEmail: string;
  onOpenImage: (src: string) => void;
  onRequestPin: (title: string, pin: string, onSuccess: () => void) => void;
  onOpenBreakdownModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  auxilios,
  comunicados,
  cortes,
  tareas,
  planilla,
  currentUserEmail,
  onOpenImage,
  onRequestPin,
  onOpenBreakdownModal,
}) => {
  const [comunicadoText, setComunicadoText] = useState('');
  const [comunicadoSearch, setComunicadoSearch] = useState('');
  const [isSendingComunicado, setIsSendingComunicado] = useState(false);

  const handleSendComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comunicadoText.trim()) return;

    setIsSendingComunicado(true);
    try {
      const author = currentUserEmail ? currentUserEmail.split('@')[0] : 'Conductor';
      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const horaStr = ahora.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await db.ref('comunicados').push({
        mensaje: comunicadoText.trim(),
        autor: author,
        fecha: `${fechaStr} ${horaStr}`,
        timestamp: Date.now(),
      });

      setComunicadoText('');
    } catch (err) {
      console.error(err);
      alert('Error al publicar comunicado');
    } finally {
      setIsSendingComunicado(false);
    }
  };

  const handleDeleteComunicado = (id: string) => {
    onRequestPin('Eliminar Comunicado Oficial', '6677', async () => {
      await db.ref(`comunicados/${id}`).remove();
    });
  };

  const handleDeleteCorte = (id: string) => {
    onRequestPin('Eliminar Aviso de Desvío', '6677', async () => {
      await db.ref(`cortes/${id}`).remove();
    });
  };

  // Convert objects to arrays
  const auxiliosList = Object.entries(auxilios || {}).map(([id, item]) => ({ ...(item as AuxilioItem), id })).reverse();
  const comunicadosList = Object.entries(comunicados || {})
    .map(([id, item]) => ({ ...(item as ComunicadoItem), id }))
    .reverse()
    .filter((c) => 
      !comunicadoSearch || 
      c.mensaje.toLowerCase().includes(comunicadoSearch.toLowerCase()) || 
      c.autor.toLowerCase().includes(comunicadoSearch.toLowerCase())
    );
  const cortesList = Object.entries(cortes || {}).map(([id, item]) => ({ ...(item as CorteItem), id })).reverse();
  const pendingTareas = Object.entries(tareas || {})
    .map(([id, item]) => ({ ...(item as TareaItem), id }))
    .filter((t) => t.estado !== 'Listo');

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Action Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                Auxilio Mecánico Rápido
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              ¿Desperfecto o Emergencia en Ruta?
            </h2>
            <p className="text-xs text-slate-500">
              Transmite ubicación GPS y foto directa al Taller y a la Guardia.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBreakdownModal}
          className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          REPORTAR COCHE ROTO
        </button>
      </motion.div>

      {/* 4 Sleek Stat Cards (from Design HTML pattern) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Auxilios en Ruta</span>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-2xl sm:text-3xl font-bold ${auxiliosList.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {auxiliosList.length}
            </span>
            <span className={`text-xs font-semibold ${auxiliosList.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {auxiliosList.length > 0 ? '¡Atención!' : 'En orden'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Tareas Taller</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {pendingTareas.length}
            </span>
            <span className="text-blue-600 text-xs font-semibold">Pendientes</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Cortes / Desvíos</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {cortesList.length}
            </span>
            <span className="text-amber-600 text-xs font-semibold">Activos</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Comunicados</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {comunicadosList.length}
            </span>
            <span className="text-slate-500 text-xs font-medium">Mural</span>
          </div>
        </div>
      </div>

      {/* Auxilios Activos Broadcast Section (if any) */}
      {auxiliosList.length > 0 && (
        <div className="bg-white border-2 border-rose-500/50 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wider">
                🚨 Auxilios Mecánicos en Ruta ({auxiliosList.length})
              </h3>
            </div>
            <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold border border-rose-200">
              Móvil de Taller Solicitado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {auxiliosList.map((aux) => (
              <div
                key={aux.id}
                className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                      {aux.interno}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{aux.fecha}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong className="text-slate-800">Conductor:</strong> {aux.conductor}
                  </p>
                  <p className="text-xs text-slate-900 font-medium bg-white p-2 rounded-lg border border-slate-200 mb-2">
                    {aux.desc}
                  </p>
                  {aux.foto && (
                    <div 
                      onClick={() => onOpenImage(aux.foto!)}
                      className="w-full rounded-xl border border-rose-200 mb-3 overflow-hidden bg-slate-950 relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={aux.foto}
                        alt="Foto Auxilio"
                        className="w-full h-48 sm:h-56 object-cover block group-hover:scale-102 transition duration-200"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
                        <Eye className="w-3.5 h-3.5 text-rose-400" />
                        Ver foto completa
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-200">
                  {aux.mapa && (
                    <a
                      href={aux.mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[130px] py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Ver en Maps
                    </a>
                  )}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🚨 *AUXILIO MECÁNICO - DIVISIÓN ÓMNIBUS*\n` +
                      `🚌 *Coche:* ${aux.interno}\n` +
                      `👤 *Chofer:* ${aux.conductor}\n` +
                      `🕒 *Hora:* ${aux.fecha}\n` +
                      `📋 *Detalle:* ${aux.desc}\n` +
                      (aux.mapa ? `📍 *Ubicación:* ${aux.mapa}\n` : '')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                    title="Compartir auxilio por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Operational Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Planilla del Día */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Planilla de Turnos
                  </h3>
                  <p className="text-xs text-slate-500">Asignación de coches y líneas</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {planilla?.fecha || 'Vigente'}
              </span>
            </div>

            {planilla?.foto ? (
              <div 
                onClick={() => onOpenImage(planilla.foto)}
                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer h-56 sm:h-64 flex items-center justify-center shadow-xs"
              >
                <img
                  src={planilla.foto}
                  alt="Planilla del Día"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
                    <Eye className="w-4 h-4 text-blue-400" />
                    Toca para ampliar y leer planilla
                  </span>
                  <span className="text-[10px] text-slate-300">Cartelera del {planilla.fecha} • {planilla.autor}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No hay planilla cargada para el día de hoy.
              </div>
            )}
          </div>

          {planilla?.foto && (
            <button
              onClick={() => onOpenImage(planilla.foto)}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Ver Planilla Completa
            </button>
          )}
        </div>

        {/* 2. Pizarra de Taller & Reparaciones Pendientes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Pizarra del Taller
                  </h3>
                  <p className="text-xs text-slate-500">Solicitudes de reparación mecánica</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {pendingTareas.length} pendientes
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {pendingTareas.length > 0 ? (
                pendingTareas.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {t.interno}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.fecha}</span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-2">{t.desc}</p>
                    </div>
                    {t.foto && (
                      <button
                        onClick={() => onOpenImage(t.foto!)}
                        className="shrink-0 text-blue-600 hover:text-blue-700 text-[11px] font-semibold"
                      >
                        Ver foto
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No hay reclamos mecánicos pendientes en este momento.
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-right">
            <span className="text-[11px] text-slate-500">
              Para marcar listo o administrar, vaya a la pestaña <b>Taller</b>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Cortes de Calle y Desvíos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cortes y Desvíos de Tránsito en Salto
              </h3>
              <p className="text-xs text-slate-500">Avisos de calles cortadas e inspectores</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 font-semibold">
            {cortesList.length} activos
          </span>
        </div>

        {cortesList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cortesList.map((corte) => (
              <div
                key={corte.id}
                className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-orange-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                      {corte.titulo || 'Corte de Calle'}
                    </span>
                    <button
                      onClick={() => handleDeleteCorte(corte.id!)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Eliminar aviso de corte"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-700 mb-2 leading-relaxed font-medium">{corte.desc}</p>
                  {corte.foto && (
                    <div
                      onClick={() => onOpenImage(corte.foto!)}
                      className="w-full rounded-xl border border-orange-200 mb-3 overflow-hidden bg-slate-950 relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={corte.foto}
                        alt="Foto del Corte"
                        className="w-full h-48 sm:h-56 object-cover block group-hover:scale-102 transition duration-200"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        Ver foto completa
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-orange-200/80 text-[11px] text-slate-500 gap-2 flex-wrap">
                  <span>Informó: <b className="text-slate-800">{corte.autor}</b></span>
                  <div className="flex items-center gap-2">
                    {corte.mapa && (
                      <a
                        href={corte.mapa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" /> Ver Mapa
                      </a>
                    )}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🚧 *AVISO DE CORTE / DESVÍO DE TRÁNSITO*\n` +
                        `⚠️ *Motivo:* ${corte.titulo || 'Corte de calle'}\n` +
                        `📋 *Detalle:* ${corte.desc}\n` +
                        `👤 *Informó:* ${corte.autor}\n` +
                        `🕒 *Fecha:* ${corte.fecha}\n` +
                        (corte.mapa ? `📍 *Ubicación:* ${corte.mapa}\n` : '')
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 text-[10px] transition"
                      title="Compartir por WhatsApp"
                    >
                      <Share2 className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            No hay cortes ni desvíos informados. Tránsito fluido en las líneas.
          </div>
        )}
      </div>

      {/* 4. Comunicados Oficiales y Mural de Choferes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Mural de Comunicados Oficiales
              </h3>
              <p className="text-xs text-slate-500">Información de servicio para el personal</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={comunicadoSearch}
              onChange={(e) => setComunicadoSearch(e.target.value)}
              placeholder="Buscar comunicado..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* New Comunicado Form */}
        <form onSubmit={handleSendComunicado} className="mb-4 flex gap-2">
          <input
            type="text"
            required
            value={comunicadoText}
            onChange={(e) => setComunicadoText(e.target.value)}
            placeholder="Escribir aviso o comunicado para todos los compañeros..."
            className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={isSendingComunicado || !comunicadoText.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publicar</span>
          </button>
        </form>

        {/* List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {comunicadosList.length > 0 ? (
            comunicadosList.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3 hover:bg-slate-100/70 transition"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-slate-800 font-medium leading-relaxed">{c.mensaje}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                      {c.autor}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{c.fecha}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `📢 *COMUNICADO OFICIAL - DIVISIÓN ÓMNIBUS*\n` +
                      `👤 *Autor:* ${c.autor}\n` +
                      `🕒 *Fecha:* ${c.fecha}\n` +
                      `💬 *Mensaje:* ${c.mensaje}\n`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-600 p-1 rounded transition"
                    title="Compartir comunicado por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteComunicado(c.id!)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                    title="Eliminar comunicado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              No hay comunicados que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* 5. Direct Emergency Dialer Component */}
      <EmergencyDialer />

      {/* 6. Radar Meteorológico en Salto */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Radar Meteorológico en Tiempo Real (Salto)
            </h3>
            <p className="text-xs text-slate-500">Monitoreo de lluvias, tormentas y vientos en la región</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-72 relative">
          <iframe
            title="Radar Meteorológico Salto"
            src="https://embed.windy.com/embed2.html?lat=-31.383&lon=-57.967&detailLat=-31.383&detailLon=-57.967&width=650&height=450&zoom=9&level=surface&overlay=radar&product=radar&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
