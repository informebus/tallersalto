import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BUS_WALLPAPERS = [
  './principal.jpg',
  './foto2.jpeg',
  './1044.jpg',
  './1062.webp',
  './1046.jpg'
];

export const DynamicBackground: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BUS_WALLPAPERS.length);
    }, 10000); // Rota cada 10 segundos

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="dynamic-background-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Dynamic Animated Images Slider */}
      <AnimatePresence mode="sync">
        <motion.img
          key={BUS_WALLPAPERS[currentImageIndex]}
          src={BUS_WALLPAPERS[currentImageIndex]}
          alt="Fondo dinámico de ómnibus"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>

      {/* Optimized Dark Contrast Overlay */}
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
    </div>
  );
};