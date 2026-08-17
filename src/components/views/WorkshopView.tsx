import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, Trash2, ShieldAlert, Upload, Loader2, MapPin } from 'lucide-react';
import { db } from '../../firebase';
import { AuxilioItem, TareaItem } from '../../types';
import { comprimirImagen } from '../../utils/image';

interface WorkshopViewProps {
  tareas: Record<string, TareaItem>;
  auxilios: Record<string, AuxilioItem>;
  onOpenImage: (src: string) => void;
  onRequestPin: (title: string, pin: string, onSuccess: () => void) => void;
}

export const WorkshopView: React.FC<WorkshopViewProps> = ({
  tareas,
  auxilios,
  onOpenImage,
  onRequestPin,
}) => {
  const [hTitulo, setHTitulo] = useState('');
  const [hFoto, setHFoto] = useState<File | null>(null);
  const [isUploadingLine, setIsUploadingLine] = useState(false);

  const tareasList = Object.entries(tareas || {}).map(([id, item]) => ({ ...(item as TareaItem), id })).reverse();
  const auxiliosList = Object.entries(auxilios || {}).map(([id, item]) => ({ ...(item as AuxilioItem), id })).reverse();

  const handleCrearLinea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hTitulo.trim() || !hFoto) {
      alert('Por favor, ingrese el nombre/título de la línea y seleccione la imagen del horario.');
      return;
    }

    setIsUploadingLine(true);
    try {
      const compressed = await comprimirImagen(hFoto);
      await db.ref('horarios').push({
        titulo: hTitulo.trim(),
        foto: compressed,
      });
      setHTitulo('');
      setHFoto(null);
      alert('¡Nueva línea de horario creada con éxito!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      alert('Error al crear línea: ' + message);
    } finally {
      setIsUploadingLine(false);
    }
  };

  const handleMarcarListo = async (id: string) => {
    try {
      await db.ref(`tareas/${id}`).update({ estado: 'Listo' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      alert('Error al actualizar tarea: ' + message);
    }
  };

  const handleBorrarTarea = (id: string) => {
    onRequestPin('Borrar Tarea de Taller', '0987', async () => {
      await db.ref(`tareas/${id}`).remove();
    });
  };

  const handleFinalizarAuxilio = async (id: string) => {
    if (window.confirm('¿Confirmar que el auxilio mecánico del coche fue solucionado?')) {
      await db.ref(`auxilios/${id}`).remove();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
              Panel Operativo del Taller
            </h2>
            <p className="text-xs text-slate-500">
              Gestión de auxilios en ruta, reparaciones y carga de nuevas líneas
            </p>
          </div>
        </div>
      </div>

      {/* 1. Auxilios Activos para Taller */}
      {auxiliosList.length > 0 && (
        <div className="bg-white border-2 border-rose-500/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wider">
                Auxilios Mecánicos en Ruta ({auxiliosList.length})
              </h3>
            </div>
            <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Requiere Móvil de Taller
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {auxiliosList.map((aux) => (
              <div
                key={aux.id}
                className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2 border-b border-rose-100 pb-2">
                    <span className="font-mono font-bold text-base text-rose-700">
                      🚨 {aux.interno}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{aux.fecha}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-1">
                    <strong className="text-slate-800">Chofer:</strong> {aux.conductor}
                  </p>
                  <p className="text-xs text-slate-900 font-medium bg-white p-2.5 rounded-lg border border-slate-200 mb-3">
                    {aux.desc}
                  </p>

                  {aux.foto && (
                    <img
                      src={aux.foto}
                      alt="Auxilio"
                      onClick={() => onOpenImage(aux.foto!)}
                      className="w-full h-28 object-cover rounded-lg border border-slate-200 mb-3 cursor-pointer hover:opacity-90 transition"
                    />
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-rose-100">
                  {aux.mapa && (
                    <a
                      href={aux.mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Ubicación GPS
                    </a>
                  )}

                  <button
                    onClick={() => handleFinalizarAuxilio(aux.id!)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar Auxilio y Liberar Coche
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pizarrón de Reparaciones Solicitadas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Pizarrón de Tareas y Mantenimiento
              </h3>
              <p className="text-xs text-slate-500">Pedidos de reparación ingresados por los conductores</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {tareasList.length} registros
          </span>
        </div>

        {tareasList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tareasList.map((t) => {
              const isListo = t.estado === 'Listo';
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                    isListo
                      ? 'bg-slate-50/50 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {t.interno}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isListo
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}
                        >
                          {isListo ? 'Listo / Reparado' : 'Pendiente'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{t.fecha}</span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium mb-3 leading-relaxed">{t.desc}</p>

                    {t.foto && (
                      <img
                        src={t.foto}
                        alt="Foto tarea"
                        onClick={() => onOpenImage(t.foto!)}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200 mb-3 cursor-pointer hover:opacity-90 transition"
                      />
                    )}

                    {t.mapa && (
                      <a
                        href={t.mapa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mb-3"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Ver mapa del reporte
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    {!isListo && (
                      <button
                        onClick={() => handleMarcarListo(t.id!)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar Listo
                      </button>
                    )}
                    <button
                      onClick={() => handleBorrarTarea(t.id!)}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold transition flex items-center justify-center gap-1 border border-slate-200"
                      title="Borrar reporte (Requiere PIN)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Borrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            No hay solicitudes de reparación cargadas.
          </div>
        )}
      </div>

      {/* 3. Crear Nueva Línea de Horario */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Administrar Horarios (Crear Línea)
            </h3>
            <p className="text-xs text-slate-500">Publica una nueva cartilla de horarios para los usuarios y choferes</p>
          </div>
        </div>

        <form onSubmit={handleCrearLinea} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Título de la Línea *
            </label>
            <input
              type="text"
              required
              value={hTitulo}
              onChange={(e) => setHTitulo(e.target.value)}
              placeholder="Ej: Línea 1 (Nacional - Parque Solari), Línea 2 (Ceibal - Salto Nuevo)..."
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Foto del Horario *
            </label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => setHFoto(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 bg-slate-50 p-2 rounded-lg border border-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingLine || !hTitulo.trim() || !hFoto}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isUploadingLine ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                SUBIR NUEVA LÍNEA AL SISTEMA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
