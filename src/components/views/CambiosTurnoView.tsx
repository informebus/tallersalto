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
  Trash2,
  Send,
  HelpCircle,
  HandMetal,
  MessageSquare,
  Bus,
  RotateCcw
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
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Aceptado' | 'Aprobado' | 'Rechazado'>('Todos');

  // Form State (New Request)
  const [fechaSolicitud, setFechaSolicitud] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [conductorSolicitante, setConductorSolicitante] = useState(
    currentUserEmail ? currentUserEmail.split('@')[0] : 'Conductor'
  );
  const [turnoOriginal, setTurnoOriginal] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Take Shift (Accept) Modal State
  const [itemToAccept, setItemToAccept] = useState<{ id: string; solicitante: string; turno: string; fecha: string } | null>(null);
  const [nombreAceptante, setNombreAceptante] = useState(
    currentUserEmail ? currentUserEmail.split('@')[0] : ''
  );
  const [isAccepting, setIsAccepting] = useState(false);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState<{ id: string; solicitante: string; turno: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Submit Shift Swap Request (No replacement required on creation)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductorSolicitante.trim() || !turnoOriginal.trim()) {
      alert('Por favor complete los datos obligatorios del turno.');
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
        estado: 'Pendiente',
        ...(motivo.trim() ? { motivo: motivo.trim() } : {}),
      };

      await db.ref('cambios_turno').push(newChange);

      // Reset form
      setTurnoOriginal('');
      setMotivo('');
      setShowRequestForm(false);
    } catch (err) {
      console.error('Error al registrar solicitud de cambio:', err);
      alert('No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Taking / Accepting a Shift
  const handleConfirmAcceptShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToAccept) return;
    if (!nombreAceptante.trim()) {
      alert('Por favor ingrese su nombre para confirmar el relevo.');
      return;
    }

    setIsAccepting(true);
    try {
      const ahora = new Date();
      const fechaAceptado = ahora.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
      }) + ' ' + ahora.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await db.ref(`cambios_turno/${itemToAccept.id}`).update({
        conductor_reemplazo: nombreAceptante.trim(),
        estado: 'Aceptado',
        fecha_aceptacion: fechaAceptado,
      });

      setItemToAccept(null);
    } catch (err) {
      console.error('Error al aceptar turno:', err);
      alert('No se pudo confirmar la aceptación del turno.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Change Status (Aprobar / Rechazar / Reabrir)
  const handleUpdateStatus = async (id: string, nuevoEstado: 'Pendiente' | 'Aceptado' | 'Aprobado' | 'Rechazado', clearReemplazo = false) => {
    setUpdatingId(id);
    try {
      const updateData: Partial<CambioTurnoItem> = {
        estado: nuevoEstado,
      };

      if (clearReemplazo) {
        updateData.conductor_reemplazo = '';
        updateData.fecha_aceptacion = '';
      }

      await db.ref(`cambios_turno/${id}`).update(updateData);
    } catch (err) {
      console.error('Error al actualizar cambio de turno:', err);
      alert('No se pudo cambiar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Shift Record
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await db.ref(`cambios_turno/${itemToDelete.id}`).remove();
      setItemToDelete(null);
    } catch (err) {
      console.error('Error al eliminar registro de turno:', err);
      alert('No se pudo eliminar el registro de la base de datos.');
    } finally {
      setIsDeleting(false);
    }
  };

  // WhatsApp Share for Shift Request
  const handleSendWhatsApp = (item: CambioTurnoItem) => {
    let mensaje = '';
    const tieneReemplazo = item.conductor_reemplazo && item.conductor_reemplazo.trim();

    if (tieneReemplazo) {
      mensaje = 
`✅ *Relevo de Turno Confirmado - División Ómnibus*

👤 *Solicitante:* ${item.conductor_solicitante}
🤝 *Cubre el turno:* ${item.conductor_reemplazo}
📅 *Fecha del Turno:* ${item.fecha_solicitud}
🚌 *Turno:* ${item.turno_original}
📌 *Estado:* ${item.estado === 'Aprobado' ? 'Aprobado oficialmente' : 'Aceptado por compañero'}

_Registro en el sistema de gestión_`;
    } else {
      mensaje = 
`📢 *Pedido de Relevo / Turno Disponible - División Ómnibus*

👤 *Solicita:* ${item.conductor_solicitante}
📅 *Fecha del Turno:* ${item.fecha_solicitud}
🚌 *Turno a cubrir:* ${item.turno_original}
${item.motivo ? `📝 *Motivo:* ${item.motivo}\n` : ''}📌 *Estado:* DISPONIBLE (Se busca chofer)

_Si puedes cubrirlo, ingresa a la app para tomar el turno._`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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
      (item.fecha_solicitud || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.motivo || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todos' || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countPendientes = itemsList.filter((i) => i.estado === 'Pendiente').length;
  const countAceptados = itemsList.filter((i) => i.estado === 'Aceptado').length;
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Cambios de Turno
                </h1>
                {countPendientes > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {countPendientes} disponible{countPendientes > 1 ? 's' : ''}
                  </span>
                )}
                {countAceptados > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {countAceptados} aceptado{countAceptados > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Publica un pedido de relevo y permite a los compañeros tomar el turno disponible
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
                <span>Publicar Pedido de Relevo</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Shift Request Form (NO replacement input needed here) */}
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
                <span>Nuevo Pedido de Relevo / Permuta</span>
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Turno / Línea / Horario a Cubrir <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Línea 2 Mañana (05:30 a 13:30), Coche 42, Turno Tarde Línea 7..."
                    value={turnoOriginal}
                    onChange={(e) => setTurnoOriginal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Motivo / Observación (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Trámite médico, Asunto personal, Cambio por franco..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  El pedido se publicará como <strong>Disponible</strong> para que cualquier compañero disponible pueda ver los detalles y aceptar cubrir tu turno.
                </span>
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
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Publicar Solicitud</span>
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
            placeholder="Buscar por solicitante, reemplazo, turno o fecha..."
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
          {(['Todos', 'Pendiente', 'Aceptado', 'Aprobado', 'Rechazado'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'Todos' ? `Todos (${itemsList.length})` :
               filter === 'Pendiente' ? `Disponibles (${countPendientes})` :
               filter === 'Aceptado' ? `Aceptados (${countAceptados})` :
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
            Utiliza el botón 'Publicar Pedido de Relevo' para solicitar cobertura de turno a tus compañeros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const isPendiente = item.estado === 'Pendiente';
            const isAceptado = item.estado === 'Aceptado';
            const isAprobado = item.estado === 'Aprobado';
            const isRechazado = item.estado === 'Rechazado';
            const tieneReemplazo = Boolean(item.conductor_reemplazo && item.conductor_reemplazo.trim());
            const isUpdating = updatingId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-150 relative overflow-hidden flex flex-col justify-between ${
                  isPendiente
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20'
                    : isAceptado
                    ? 'border-blue-500/40 bg-slate-900/90'
                    : isAprobado
                    ? 'border-emerald-500/30'
                    : 'border-rose-500/20 opacity-80'
                }`}
              >
                <div>
                  {/* Status Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isPendiente
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isAceptado
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : isAprobado
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isPendiente && (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Disponible / Se busca relevo</span>
                        </>
                      )}
                      {isAceptado && (
                        <>
                          <UserCheck className="w-3 h-3 text-blue-400" />
                          <span>Relevo Aceptado</span>
                        </>
                      )}
                      {isAprobado && (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Aprobado / Confirmado</span>
                        </>
                      )}
                      {isRechazado && (
                        <>
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Rechazado</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                      {item.fecha_solicitud}
                    </span>
                  </div>

                  {/* Shift Detail Card */}
                  <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 mb-3 space-y-2.5">
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold tracking-wider">
                        Turno a Cubrir
                      </span>
                      <strong className="text-slate-100 text-sm font-semibold block mt-0.5">
                        {item.turno_original}
                      </strong>
                      {item.motivo && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          "{item.motivo}"
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/60">
                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                          Solicitante
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 font-medium text-slate-200">
                          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{item.conductor_solicitante}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                          Chofer Reemplazo
                        </span>
                        {tieneReemplazo ? (
                          <div className="flex items-center gap-1.5 mt-1 font-medium text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.conductor_reemplazo}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-1 text-amber-400 text-[11px] font-semibold">
                            <span>Pendiente de chofer</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.fecha_aceptacion && (
                      <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/40">
                        <span>Aceptado el {item.fecha_aceptacion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions: WhatsApp, Take Shift, Approve/Reject, Delete */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  {/* WhatsApp button */}
                  <button
                    onClick={() => handleSendWhatsApp(item)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                    title="Compartir por WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* If Still Open / Pendiente: Show 'Tomar Turno' button */}
                    {isPendiente && (
                      <button
                        onClick={() => {
                          setItemToAccept({
                            id: item.id,
                            solicitante: item.conductor_solicitante,
                            turno: item.turno_original,
                            fecha: item.fecha_solicitud,
                          });
                          setNombreAceptante(currentUserEmail ? currentUserEmail.split('@')[0] : '');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                        title="Aceptar cubrir este turno"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Aceptar Relevo</span>
                      </button>
                    )}

                    {/* If Aceptado: Options to Approve or Liberate */}
                    {isAceptado && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(item.id, 'Pendiente', true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
                          title="Liberar turno nuevamente"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Liberar</span>
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(item.id, 'Aprobado')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                          title="Confirmar aprobación oficial"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Aprobar</span>
                        </button>
                      </>
                    )}

                    {/* If Aprobado or Rechazado: Reopen toggle */}
                    {(isAprobado || isRechazado) && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(item.id, 'Pendiente')}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer px-1"
                      >
                        Reabrir
                      </button>
                    )}

                    {/* Delete button (Always available for finished/cancelled swaps) */}
                    <button
                      onClick={() => setItemToDelete({
                        id: item.id,
                        solicitante: item.conductor_solicitante,
                        turno: item.turno_original,
                      })}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs transition-all cursor-pointer"
                      title="Eliminar este cambio de turno"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Accept Shift / Tomar Turno */}
      <AnimatePresence>
        {itemToAccept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Aceptar Relevo de Turno</h3>
                    <p className="text-xs text-slate-400">Confirma que cubrirás el servicio</p>
                  </div>
                </div>
                <button
                  onClick={() => setItemToAccept(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Turno a cubrir:</span>
                  <strong className="text-white text-sm font-semibold">{itemToAccept.turno}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Fecha:</span>
                    <span className="text-indigo-300 font-medium">{itemToAccept.fecha}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Solicitante:</span>
                    <span className="text-slate-200 font-medium">{itemToAccept.solicitante}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmAcceptShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Tu Nombre o Número de Chofer <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ingresa tu nombre para confirmar el relevo..."
                    value={nombreAceptante}
                    onChange={(e) => setNombreAceptante(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemToAccept(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAccepting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {isAccepting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar que Cubro el Turno</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Deletion */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Eliminar Registro de Turno</h3>
                    <p className="text-xs text-slate-400">¿Desea borrar esta solicitud de la base de datos?</p>
                  </div>
                </div>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 block mb-0.5">Turno a eliminar:</span>
                <strong className="text-rose-300 text-sm font-semibold">{itemToDelete.turno}</strong>
                <p className="text-[11px] text-slate-400 mt-1">
                  Solicitado por: <strong>{itemToDelete.solicitante}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar Definitivamente</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
