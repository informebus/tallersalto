import React, { useState } from 'react';
import { Clock, MapPin, Eye, Upload, Trash2, Key, Search, FileImage, ShieldCheck, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { CodigoItem, HorarioItem } from '../../types';
import { comprimirImagen } from '../../utils/image';

interface SchedulesViewProps {
  horarios: Record<string, HorarioItem>;
  codigos: CodigoItem | null;
  onOpenImage: (src: string) => void;
  onRequestPin: (title: string, pin: string, onSuccess: () => void) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  horarios,
  codigos,
  onOpenImage,
  onRequestPin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUpdateFiles, setSelectedUpdateFiles] = useState<Record<string, File>>({});
  const [isUploadingCodigos, setIsUploadingCodigos] = useState(false);
  const [codigoFile, setCodigoFile] = useState<File | null>(null);

  const horariosList = Object.entries(horarios || {}).map(([id, item]) => ({ ...(item as HorarioItem), id }));

  const handleUpdateScheduleImage = (id: string) => {
    const file = selectedUpdateFiles[id];
    if (!file) {
      alert('Primero debes seleccionar un nuevo archivo de imagen para este horario.');
      return;
    }

    onRequestPin('Actualizar Imagen de Horario', '0987', async () => {
      setUpdatingId(id);
      try {
        const compressed = await comprimirImagen(file);
        await db.ref(`horarios/${id}`).update({ foto: compressed });
        setSelectedUpdateFiles((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        alert('¡Imagen de horario actualizada correctamente!');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al actualizar';
        alert('Error: ' + message);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleDeleteSchedule = (id: string, titulo: string) => {
    onRequestPin(`Eliminar ${titulo}`, '0987', async () => {
      try {
        await db.ref(`horarios/${id}`).remove();
        alert('Línea de horario eliminada con éxito.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al eliminar';
        alert('Error: ' + message);
      }
    });
  };

  const handleUploadCodigos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoFile) return;

    onRequestPin('Actualizar Cartilla de Códigos', '0987', async () => {
      setIsUploadingCodigos(true);
      try {
        const compressed = await comprimirImagen(codigoFile);
        await db.ref('codigos').set({
          foto: compressed,
          timestamp: Date.now(),
        });
        setCodigoFile(null);
        alert('¡Cartilla de Códigos de Destino actualizada con éxito!');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al subir códigos';
        alert('Error: ' + message);
      } finally {
        setIsUploadingCodigos(false);
      }
    });
  };

  const filteredHorarios = horariosList.filter((h) =>
    h.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                Horarios y Cartillas Oficiales
              </h2>
              <p className="text-xs text-slate-500">
                Líneas de la Intendencia de Salto y códigos de destinos
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número o nombre de línea..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredHorarios.length > 0 ? (
          filteredHorarios.map((h) => {
            const hasSelectedFile = !!selectedUpdateFiles[h.id!];
            const isUpdatingThis = updatingId === h.id;

            return (
              <div
                key={h.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  {/* Card Title */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 truncate max-w-[170px]" title={h.titulo}>
                      {h.titulo}
                    </h3>
                    <button
                      onClick={() => handleDeleteSchedule(h.id!, h.titulo)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Eliminar horario (Requiere autorización)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative group p-3 bg-slate-50 flex items-center justify-center min-h-[160px]">
                    <img
                      src={h.foto}
                      alt={h.titulo}
                      className="max-w-full max-h-48 object-contain bg-white rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => onOpenImage(h.foto)}
                      className="absolute inset-3 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg text-white text-xs font-semibold gap-1.5 backdrop-blur-xs"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Horario
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                  <button
                    onClick={() => onOpenImage(h.foto)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Ampliar Horario
                  </button>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedUpdateFiles((prev) => ({ ...prev, [h.id!]: file }));
                          }
                        }}
                        className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 flex-1"
                      />
                      {hasSelectedFile && (
                        <button
                          onClick={() => handleUpdateScheduleImage(h.id!)}
                          disabled={isUpdatingThis}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 transition"
                        >
                          {isUpdatingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Guardar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No se encontraron horarios con ese término de búsqueda.
          </div>
        )}
      </div>

      {/* Nuevos Códigos de Destinos Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Nuevos Códigos de Destinos
              </h3>
              <p className="text-xs text-slate-500">
                Códigos numéricos actualizados para configuración de banderas y letreros
              </p>
            </div>
          </div>

          {codigos?.foto && (
            <button
              onClick={() => onOpenImage(codigos.foto)}
              className="py-2 px-4 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-4 h-4" />
              Ver Códigos Completos
            </button>
          )}
        </div>

        {codigos?.foto ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 min-h-[180px]">
            <img
              src={codigos.foto}
              alt="Nuevos Códigos de Destino"
              className="max-w-full max-h-96 object-contain mx-auto rounded-lg shadow-2xs"
            />
            <button
              onClick={() => onOpenImage(codigos.foto)}
              className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl text-white text-xs font-semibold gap-2 backdrop-blur-xs"
            >
              <Eye className="w-4 h-4" />
              Ampliar Nuevos Códigos
            </button>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            Aún no se ha cargado la foto con los nuevos códigos de destinos.
          </div>
        )}

        {/* Upload new codes */}
        <form onSubmit={handleUploadCodigos} className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Actualizar Imagen de Códigos
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCodigoFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 bg-slate-50 p-1.5 rounded-lg border border-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingCodigos || !codigoFile}
            className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 sm:mt-5"
          >
            {isUploadingCodigos ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir Nuevos Códigos
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
