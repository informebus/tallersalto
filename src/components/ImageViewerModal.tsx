import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageViewerModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ src, alt = 'Imagen ampliada', onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!src) return null;

  const handleZoomToggle = () => {
    setZoom((prev) => (prev > 1.2 ? 1 : 2.2));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 sm:p-6"
        onClick={onClose}
      >
        {/* Top bar controls */}
        <div 
          className="w-full max-w-4xl flex items-center justify-between z-10 py-2.5 px-4 bg-white rounded-2xl border border-slate-200 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 text-slate-800 text-sm font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Visor de Documento / Foto
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
              title="Aumentar zoom"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 0.8))}
              title="Reducir zoom"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Girar 90°"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              download="documento-omnibus.jpg"
              title="Abrir en pestaña / Descargar"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              title="Cerrar visor"
              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div 
          className="flex-1 w-full flex items-center justify-center overflow-auto my-2 touch-pinch-zoom cursor-grab active:cursor-grabbing"
          onClick={handleZoomToggle}
        >
          <motion.img
            src={src}
            alt={alt}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}
            className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleZoomToggle}
          />
        </div>

        {/* Footer tip */}
        <div 
          className="text-xs text-slate-300 bg-slate-950/70 px-4 py-1.5 rounded-full border border-slate-800 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          Toca dos veces para {zoom > 1.2 ? 'restaurar' : 'ampliar'} • Toca fuera para cerrar
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
