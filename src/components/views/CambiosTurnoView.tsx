import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Clock, 
  Check, 
  X, 
  Calendar, 
  UserCheck, 
  User, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  CalendarDays,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { CambioTurnoItem } from '../../types';

interface CambiosTurnoViewProps {
  cambios: Record<string, CambioTurnoItem>;
  currentUserEmail: string;
}

export const CambiosTurnoView: React.FC<CambiosTurnoViewProps> = ({
  cambios,
  currentUserEmail,
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('Todos');

  // Form State
  const [fechaSolicitud, setFechaSolicitud] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [conductorSolicitante, setConductorSolicitante] = useState(
    currentUserEmail ? currentUserEmail.split('@')[0] : 'Conductor'
  );
  const [turnoOriginal, setTurnoOriginal] = useState('');
  const [conductorReemplazo, setConductorReemplazo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Submit Shift Swap Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductorSolicitante.trim() || !turnoOriginal.trim() || !conductorReemplazo.trim()) {
      alert('Por favor complete todos los campos de la solicitud.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format date nicely if in YYYY-MM-DD
      let formattedDate = fechaSolicitud;
      if (fechaSolicitud.includes('-')) {
        const [y, m, d] = fechaSolicitud.split('-');
        formattedDate = `${d}/${m}/${y}`;
      }

      const newChange: Omit<CambioTurnoItem, 'id'> = {
        fecha_solicitud: formattedDate,
        conductor_solicitante: conductorSolicitante.trim(),
        turno_original: turnoOriginal.trim(),
        conductor_reemplazo: conductorReemplazo.trim(),
        estado: 'Pendiente',
      };

      await db.ref('cambios_turno').push(newChange);

      // Reset form
      setTurnoOriginal('');
      setConductorReemplazo('');
      setShowRequestForm(false);
    } catch (err) {
      console.error('Error al registrar solicitud de cambio:', err);
      alert('No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change Status (Aprobar / Rechazar / Pendiente)
  const handleUpdateStatus = async (id: string, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
    setUpdatingId(id);
    try {
      await db.ref(`cambios_turno/${id}`).update({
        estado: nuevoEstado,
      });
    } catch (err) {
      console.error('Error al actualizar cambio de turno:', err);
      alert('No se pudo cambiar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Convert to sorted list (newest first)
  const itemsList: (CambioTurnoItem & { id: string })[] = Object.entries(cambios || {})
    .filter(([_, item]) => typeof item === 'object' && item !== null)
    .map(([id, item]) => ({
      ...(item as CambioTurnoItem),
      id,
    }))
    .reverse();

  const filteredItems = itemsList.filter((item) => {
    const matchesSearch =
      (item.conductor_solicitante || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.conductor_reemplazo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.turno_original || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fecha_solicitud || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todos' || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countPendientes = itemsList.filter((i) => i.estado === 'Pendiente').length;
  const countAprobados = itemsList.filter((i) => i.estado === 'Aprobado').length;
  const countRechazados = itemsList.filter((i) => i.estado === 'Rechazado').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Cambios de Turno
                </h1>
                {countPendientes > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {countPendientes} pendiente{countPendientes > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Solicitudes de relevos y permutas de servicio entre conductores
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRequestForm((prev) => !prev)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
          >
            {showRequestForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Cerrar Formulario</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Solicitar Cambio</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Shift Request Form */}
        <AnimatePresence>
          {showRequestForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="mt-5 pt-5 border-t border-slate-800/80 space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nueva Solicitud de Permuta / Relevo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Fecha del Turno <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaSolicitud}
                    onChange={(e) => setFechaSolicitud(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Conductor Solicitante <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre o número de chofer"
                    value={conductorSolicitante}
                    onChange={(e) => setConductorSolicitante(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Turno Original a Cambiar <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Línea 2 Mañana (05:30 a 13:30), Coche 42..."
                    value={turnoOriginal}
                    onChange={(e) => setTurnoOriginal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Conductor de Reemplazo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del compañero que cubre el turno"
                    value={conductorReemplazo}
                    onChange={(e) => setConductorReemplazo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Registrar Solicitud</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por conductor, turno o fecha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto">
          {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'Todos' ? `Todos (${itemsList.length})` :
               filter === 'Pendiente' ? `Pendientes (${countPendientes})` :
               filter === 'Aprobado' ? `Aprobados (${countAprobados})` :
               `Rechazados (${countRechazados})`}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Swap Requests List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">
            {searchQuery || statusFilter !== 'Todos'
              ? 'No se encontraron solicitudes con ese filtro'
              : 'No hay solicitudes de cambios de turno'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Utiliza el botón 'Solicitar Cambio' para registrar un relevo o permuta con otro chofer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const isPendiente = item.estado === 'Pendiente';
            const isAprobado = item.estado === 'Aprobado';
            const isRechazado = item.estado === 'Rechazado';
            const isUpdating = updatingId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-150 relative overflow-hidden flex flex-col justify-between ${
                  isPendiente
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20'
                    : isAprobado
                    ? 'border-emerald-500/30'
                    : 'border-rose-500/20 opacity-80'
                }`}
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isPendiente
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isAprobado
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isPendiente && (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Pendiente de Aprobación</span>
                        </>
                      )}
                      {isAprobado && (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aprobado</span>
                        </>
                      )}
                      {isRechazado && (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Rechazado</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                      {item.fecha_solicitud}
                    </span>
                  </div>

                  {/* Swap Detail Card */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-3 space-y-2">
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold tracking-wider">
                        Turno a Cubrir
                      </span>
                      <strong className="text-slate-200 text-sm font-semibold block mt-0.5">
                        {item.turno_original}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                          Solicita
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 font-medium text-slate-300">
                          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{item.conductor_solicitante}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                          Reemplaza
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 font-medium text-emerald-400">
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.conductor_reemplazo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: Approve / Reject (shown if Pendiente, or status toggle) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    ID: #{item.id.slice(-5)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isPendiente ? (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(item.id, 'Rechazar' as any)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(item.id, 'Aprobado')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Aprobar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(item.id, 'Pendiente')}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Reabrir / Cambiar Estado
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
