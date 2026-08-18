import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageViewerModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
  src, 
  alt = 'Imagen ampliada', 
  onClose 
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs for gesture calculations
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialPos: { x: number; y: number };
    startTouchPos: { x: number; y: number };
    lastTouchTime: number;
    isPinching: boolean;
    isPanning: boolean;
  }>({
    initialDist: 0,
    initialZoom: 1,
    initialPos: { x: 0, y: 0 },
    startTouchPos: { x: 0, y: 0 },
    lastTouchTime: 0,
    isPinching: false,
    isPanning: false,
  });

  const mouseDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    active: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    active: false,
  });

  // Reset transform when new image opens
  useEffect(() => {
    if (src) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [src]);

  // Handle zoom bounds
  const applyZoom = useCallback((newZoom: number, focusX?: number, focusY?: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, 0.8), 6);
    setZoom(clampedZoom);
    if (clampedZoom <= 1.05) {
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') applyZoom(zoom + 0.5);
      if (e.key === '-') applyZoom(zoom - 0.5);
      if (e.key === '0') handleResetZoom();
      if (e.key === 'r' || e.key === 'R') setRotation((r) => (r + 90) % 360);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, onClose, applyZoom]);

  // Touch Handlers for Pinch-to-zoom & Pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;

    if (touches.length === 2) {
      // Pinch gesture start
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      touchStateRef.current = {
        ...touchStateRef.current,
        initialDist: dist,
        initialZoom: zoom,
        initialPos: { ...position },
        isPinching: true,
        isPanning: false,
      };
    } else if (touches.length === 1) {
      const t = touches[0];
      const now = Date.now();
      const timeDiff = now - touchStateRef.current.lastTouchTime;

      // Double-tap detection (< 300ms)
      if (timeDiff < 300 && timeDiff > 40) {
        // Double tap toggle
        if (zoom > 1.2) {
          setZoom(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setZoom(2.5);
          // Optional center focal shift
          setPosition({ x: 0, y: 0 });
        }
        touchStateRef.current.lastTouchTime = 0;
        return;
      }

      touchStateRef.current.lastTouchTime = now;
      touchStateRef.current.startTouchPos = { x: t.clientX, y: t.clientY };
      touchStateRef.current.initialPos = { ...position };
      touchStateRef.current.isPinching = false;
      touchStateRef.current.isPanning = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;

    if (touches.length === 2 && touchStateRef.current.isPinching) {
      // Pinching with 2 fingers
      e.preventDefault();
      const t1 = touches[0];
      const t2 = touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleFactor = newDist / (touchStateRef.current.initialDist || 1);
      const newZoom = Math.min(Math.max(touchStateRef.current.initialZoom * scaleFactor, 0.8), 6);
      
      setZoom(newZoom);

      // Adjust panning proportionally
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      // Keep smooth
    } else if (touches.length === 1 && touchStateRef.current.isPanning && zoom > 1.05) {
      // Panning with 1 finger when zoomed in
      e.preventDefault();
      const t = touches[0];
      const deltaX = t.clientX - touchStateRef.current.startTouchPos.x;
      const deltaY = t.clientY - touchStateRef.current.startTouchPos.y;

      setPosition({
        x: touchStateRef.current.initialPos.x + deltaX,
        y: touchStateRef.current.initialPos.y + deltaY,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      touchStateRef.current.isPinching = false;
      touchStateRef.current.isPanning = false;

      // Snap back if zoom was pinched smaller than 1
      if (zoom < 1) {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      // Transition from 2 fingers to 1 finger
      const t = e.touches[0];
      touchStateRef.current.startTouchPos = { x: t.clientX, y: t.clientY };
      touchStateRef.current.initialPos = { ...position };
      touchStateRef.current.isPinching = false;
      touchStateRef.current.isPanning = true;
    }
  };

  // Mouse Wheel Zoom (Desktop)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    applyZoom(zoom + zoomDelta);
  };

  // Mouse Drag (Desktop)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1.05) return;
    mouseDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      active: true,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseDragRef.current.active) return;
    const deltaX = e.clientX - mouseDragRef.current.startX;
    const deltaY = e.clientY - mouseDragRef.current.startY;
    setPosition({
      x: mouseDragRef.current.initialX + deltaX,
      y: mouseDragRef.current.initialY + deltaY,
    });
  };

  const handleMouseUp = () => {
    mouseDragRef.current.active = false;
    setIsDragging(false);
  };

  if (!src) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/92 backdrop-blur-md p-2.5 sm:p-5 select-none"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div 
          className="w-full max-w-4xl flex items-center justify-between z-10 py-2 sm:py-2.5 px-3 sm:px-4 bg-white/95 rounded-2xl border border-slate-200 shadow-2xl backdrop-blur-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[220px]">
                Visor de Imagen
              </span>
              {zoom !== 1 && (
                <button
                  onClick={handleResetZoom}
                  title="Restaurar tamaño original (100%)"
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1"
                >
                  {Math.round(zoom * 100)}%
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom In (+) */}
            <button
              onClick={() => applyZoom(zoom + 0.4)}
              title="Aumentar zoom (+)"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out (-) */}
            <button
              onClick={() => applyZoom(zoom - 0.4)}
              title="Reducir zoom (-)"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Rotate (90°) */}
            <button
              onClick={handleRotate}
              title="Girar 90°"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Open in new tab / Download */}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              download="imagen-omnibus-salto.jpg"
              title="Abrir en pestaña nueva / Descargar"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close (X) */}
            <button
              onClick={onClose}
              title="Cerrar visor"
              className="p-2 sm:p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition ml-0.5 sm:ml-1 shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Image Display Area with Pinch-to-Zoom & Pan */}
        <div 
          ref={containerRef}
          className={`flex-1 w-full flex items-center justify-center overflow-hidden my-2 touch-none relative ${
            zoom > 1.05 
              ? isDragging ? 'cursor-grabbing' : 'cursor-grab' 
              : 'cursor-default'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => {
            // If clicked directly on the empty background, close
            if (e.target === containerRef.current) {
              onClose();
            }
          }}
        >
          <div
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: touchStateRef.current.isPinching || touchStateRef.current.isPanning || mouseDragRef.current.active
                ? 'none'
                : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
              willChange: 'transform',
            }}
            className="flex items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              draggable={false}
              className="max-w-[92vw] sm:max-w-[85vw] max-h-[76vh] object-contain rounded-xl shadow-2xl select-none"
            />
          </div>
        </div>

        {/* Footer Instructions with Mobile Gestures Tip */}
        <div 
          className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300 bg-slate-900/85 px-4 py-1.5 rounded-full border border-slate-800 backdrop-blur-xs shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="hidden sm:inline">🤏 Pellizca con 2 dedos o usa la rueda del mouse para zoom</span>
          <span className="sm:hidden">🤏 Pellizca con 2 dedos para agrandar/achicar</span>
          <span className="text-slate-500">•</span>
          <span>Doble toque para {zoom > 1.2 ? 'restaurar' : 'acercar'}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
