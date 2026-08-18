import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CalendarPlus, 
  Camera, 
  MapPin, 
  Upload, 
  Loader2, 
  ShieldAlert,
  Send,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../firebase';
import { comprimirImagen, comprimirPlanillaDocumento, obtenerCoordenadasGPS } from '../../utils/image';
import { ImageUploadPicker } from '../ImageUploadPicker';

interface DriversViewProps {
  currentUserEmail: string;
  onOpenBreakdownModal: () => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  currentUserEmail,
  onOpenBreakdownModal,
}) => {
  const defaultAuthor = currentUserEmail ? currentUserEmail.split('@')[0] : 'Conductor';

  // 1. Solicitud de Reparación
  const [repInterno, setRepInterno] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repFoto, setRepFoto] = useState<File | null>(null);
  const [repUsarGps, setRepUsarGps] = useState(false);
  const [isSubmittingRep, setIsSubmittingRep] = useState(false);
  const [repSuccess, setRepSuccess] = useState(false);

  // 2. Corte de Calle
  const [corteTitulo, setCorteTitulo] = useState('');
  const [corteDesc, setCorteDesc] = useState('');
  const [corteFoto, setCorteFoto] = useState<File | null>(null);
  const [corteUsarGps, setCorteUsarGps] = useState(true);
  const [isSubmittingCorte, setIsSubmittingCorte] = useState(false);
  const [corteSuccess, setCorteSuccess] = useState(false);

  // 3. Subir Planilla del Día
  const [planillaFecha, setPlanillaFecha] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [planillaFile, setPlanillaFile] = useState<File | null>(null);
  const [isSubmittingPlanilla, setIsSubmittingPlanilla] = useState(false);
  const [planillaSuccess, setPlanillaSuccess] = useState(false);

  // Handlers
  const handleReparacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repInterno.trim() || !repDesc.trim()) return;

    setIsSubmittingRep(true);
    try {
      let mapaUrl: string | null = null;
      if (repUsarGps) {
        try {
          const coords = await obtenerCoordenadasGPS();
          mapaUrl = coords.mapa;
        } catch (e) {
          console.warn('GPS no disponible:', e);
        }
      }

      let fotoBase64: string | null = null;
      if (repFoto) {
        fotoBase64 = await comprimirImagen(repFoto, 800, 0.7);
      }

      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' });
      const horaStr = ahora.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });

      await db.ref('tareas').push({
        interno: repInterno.toUpperCase().trim(),
        desc: repDesc.trim(),
        fecha: `${fechaStr} ${horaStr}`,
        estado: 'Pendiente',
        foto: fotoBase64,
        mapa: mapaUrl,
        autor: defaultAuthor,
        timestamp: Date.now(),
      });

      setRepInterno('');
      setRepDesc('');
      setRepFoto(null);
      setRepSuccess(true);
      setTimeout(() => setRepSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert('Error: ' + message);
    } finally {
      setIsSubmittingRep(false);
    }
  };

  const handleCorteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corteTitulo.trim() || !corteDesc.trim()) return;

    setIsSubmittingCorte(true);
    try {
      let mapaUrl: string | null = null;
      if (corteUsarGps) {
        try {
          const coords = await obtenerCoordenadasGPS();
          mapaUrl = coords.mapa;
        } catch (e) {
          console.warn('GPS no disponible:', e);
        }
      }

      let fotoBase64: string | null = null;
      if (corteFoto) {
        fotoBase64 = await comprimirImagen(corteFoto, 800, 0.7);
      }

      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' });

      await db.ref('cortes').push({
        titulo: corteTitulo.trim(),
        desc: corteDesc.trim(),
        autor: defaultAuthor,
        fecha: fechaStr,
        foto: fotoBase64,
        mapa: mapaUrl,
        timestamp: Date.now(),
      });

      setCorteTitulo('');
      setCorteDesc('');
      setCorteFoto(null);
      setCorteSuccess(true);
      setTimeout(() => setCorteSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert('Error: ' + message);
    } finally {
      setIsSubmittingCorte(false);
    }
  };

  const handlePlanillaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planillaFile) {
      alert('Por favor, seleccione o tome la foto de la planilla.');
      return;
    }

    setIsSubmittingPlanilla(true);
    try {
      const fotoBase64 = await comprimirPlanillaDocumento(planillaFile, 2048, 0.88);
      const [year, month, day] = planillaFecha.split('-');
      const fechaFormateada = `${day}/${month}/${year}`;

      await db.ref('planillas').set({
        fecha: fechaFormateada,
        foto: fotoBase64,
        autor: defaultAuthor,
        timestamp: Date.now(),
      });

      setPlanillaFile(null);
      setPlanillaSuccess(true);
      setTimeout(() => setPlanillaSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir planilla';
      alert('Error: ' + message);
    } finally {
      setIsSubmittingPlanilla(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Operativa Diaria
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Panel de Operaciones para Conductores
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Carga de reportes mecánicos, desvíos de tránsito y planilla diaria de coches
          </p>
        </div>

        <button
          onClick={onOpenBreakdownModal}
          className="py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          AUXILIO MECÁNICO SOS
        </button>
      </div>

      {/* Grid of Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Pedido de Reparación Mecánica */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Solicitud de Reparación (Taller)
                  </h3>
                  <p className="text-xs text-slate-500">Anotar desperfecto mecánico no urgente</p>
                </div>
              </div>
              {repSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Enviado!
                </span>
              )}
            </div>

            <form onSubmit={handleReparacionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  N° de Coche / Interno *
                </label>
                <input
                  type="text"
                  required
                  value={repInterno}
                  onChange={(e) => setRepInterno(e.target.value)}
                  placeholder="Ej: Coche 35"
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción del Reclamo / Falla *
                </label>
                <textarea
                  required
                  rows={2}
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  placeholder="Ej: Pierde aire por la puerta delantera, luz de freno izquierda quemada..."
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Foto con opciones de Cámara o Galería */}
              <ImageUploadPicker
                idPrefix="rep-foto"
                label="Foto del Problema (Opcional)"
                selectedFile={repFoto}
                onFileSelect={setRepFoto}
                accentColor="blue"
                helpText="Puedes tomar una foto directamente con la cámara del celular o seleccionar de la galería."
              />

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 font-medium">Adjuntar Ubicación GPS</span>
                <input
                  type="checkbox"
                  checked={repUsarGps}
                  onChange={(e) => setRepUsarGps(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingRep}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmittingRep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar al Pizarrón del Taller
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Form 2: Reportar Corte de Calle o Desvío */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Informar Corte / Desvío
                  </h3>
                  <p className="text-xs text-slate-500">Avisar calle cerrada para compañeros</p>
                </div>
              </div>
              {corteSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Publicado!
                </span>
              )}
            </div>

            <form onSubmit={handleCorteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ubicación o Calle *
                </label>
                <input
                  type="text"
                  required
                  value={corteTitulo}
                  onChange={(e) => setCorteTitulo(e.target.value)}
                  placeholder="Ej: Av. Barbieri y Viera (Obra OSE)"
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detalle del Desvío Recomendado *
                </label>
                <textarea
                  required
                  rows={2}
                  value={corteDesc}
                  onChange={(e) => setCorteDesc(e.target.value)}
                  placeholder="Ej: Tomar por 8 de Octubre hacia el centro para evitar pozo profundo..."
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              {/* Foto con opciones de Cámara o Galería */}
              <ImageUploadPicker
                idPrefix="corte-foto"
                label="Foto del Corte / Cartel (Opcional)"
                selectedFile={corteFoto}
                onFileSelect={setCorteFoto}
                accentColor="orange"
                helpText="Captura el desvío o cartel con la cámara o sube desde la galería."
              />

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 font-medium">Incluir Coordenadas GPS</span>
                <input
                  type="checkbox"
                  checked={corteUsarGps}
                  onChange={(e) => setCorteUsarGps(e.target.checked)}
                  className="w-4 h-4 accent-orange-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCorte}
                className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmittingCorte ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar Aviso de Desvío
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Form 3: Subida de Planilla de Coches del Día */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Actualizar Planilla Diaria de Turnos
              </h3>
              <p className="text-xs text-slate-500">Fotografía la cartelera de turnos del día para el personal</p>
            </div>
          </div>
          {planillaSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ¡Planilla Actualizada!
            </span>
          )}
        </div>

        <form onSubmit={handlePlanillaSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de la Planilla
              </label>
              <input
                type="date"
                required
                value={planillaFecha}
                onChange={(e) => setPlanillaFecha(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              {/* Foto Planilla Cámara / Galería */}
              <ImageUploadPicker
                idPrefix="planilla-foto"
                label="Foto de la Cartelera *"
                required={true}
                selectedFile={planillaFile}
                onFileSelect={setPlanillaFile}
                accentColor="emerald"
                helpText="Toma foto nítida de la cartelera con la cámara o súbela de la galería."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingPlanilla || !planillaFile}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isSubmittingPlanilla ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                PUBLICAR PLANILLA EN EL TABLERO
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
