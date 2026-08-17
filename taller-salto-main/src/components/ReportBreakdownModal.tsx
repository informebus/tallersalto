import React, { useState } from 'react';
import { ShieldAlert, X, MapPin, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { comprimirImagen, obtenerCoordenadasGPS } from '../utils/image';
import { ImageUploadPicker } from './ImageUploadPicker';

interface ReportBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDriver?: string;
}

export const ReportBreakdownModal: React.FC<ReportBreakdownModalProps> = ({
  isOpen,
  onClose,
  defaultDriver = '',
}) => {
  const [interno, setInterno] = useState('');
  const [conductor, setConductor] = useState(defaultDriver);
  const [desc, setDesc] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [usarGps, setUsarGps] = useState(true);
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interno.trim() || !desc.trim()) {
      alert('Por favor, complete el número de coche y la falla mecánica.');
      return;
    }

    setEnviando(true);
    try {
      let mapaUrl: string | null = null;
      if (usarGps) {
        try {
          const gps = await obtenerCoordenadasGPS();
          mapaUrl = gps.mapa;
        } catch (gpsError) {
          console.warn('GPS no disponible:', gpsError);
        }
      }

      let fotoBase64: string | null = null;
      if (fotoFile) {
        fotoBase64 = await comprimirImagen(fotoFile, 800, 0.75);
      }

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

      const auxilioPayload = {
        interno: interno.toUpperCase().trim(),
        conductor: conductor.trim() || 'Conductor',
        desc: desc.trim(),
        fecha: `${fechaStr} • ${horaStr}`,
        foto: fotoBase64,
        mapa: mapaUrl,
        timestamp: Date.now(),
      };

      await db.ref('auxilios').push(auxilioPayload);

      setInterno('');
      setDesc('');
      setFotoFile(null);
      onClose();
      alert('🚨 ¡Auxilio Mecánico transmitido con éxito al Taller y a la Guardia!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar reporte';
      alert('Error: ' + message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  Reportar Auxilio Mecánico Inmediato
                </h3>
                <p className="text-xs text-rose-700 font-medium">Aviso de urgencia en ruta al Taller de Salto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  N° de Coche / Interno *
                </label>
                <input
                  type="text"
                  required
                  value={interno}
                  onChange={(e) => setInterno(e.target.value)}
                  placeholder="Ej: Coche 42"
                  className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Conductor / Funcionario
                </label>
                <input
                  type="text"
                  value={conductor}
                  onChange={(e) => setConductor(e.target.value)}
                  placeholder="Nombre"
                  className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Descripción de la Falla / Ubicación *
              </label>
              <textarea
                required
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ej: Corte de manguera de freno en Av. Rodó y Apolón. Coche detenido a la derecha."
                className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* GPS Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${usarGps ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-800">
                  Transmitir Ubicación GPS del Teléfono
                </span>
              </div>
              <input
                type="checkbox"
                checked={usarGps}
                onChange={(e) => setUsarGps(e.target.checked)}
                className="w-4 h-4 accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Photo Capture */}
            <ImageUploadPicker
              idPrefix="sos-foto"
              label="Foto del Desperfecto / Lugar (Opcional)"
              selectedFile={fotoFile}
              onFileSelect={setFotoFile}
              accentColor="rose"
              helpText="Sube una foto desde la cámara o la galería para agilizar la asistencia."
            />

            {/* Submit */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={enviando}
                className="flex-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmitiendo SOS...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    TRANSMITIR AUXILIO AHORA
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
