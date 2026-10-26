import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Rutas absolutas fijas para el entorno de GitHub Pages
const BUS_WALLPAPERS = [
  '/tallersalto/fondos/principal.jpg',
  '/tallersalto/fondos/foto2.jpeg',
  '/tallersalto/fondos/1044.jpg',
  '/tallersalto/fondos/1062.webp',
  '/tallersalto/fondos/1046.jpg',
  '/tallersalto/fondos/him002.webp',
  '/tallersalto/fondos/micro.jpg',
  '/tallersalto/fondos/foto6.jpeg'
];

export const DynamicBackground: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BUS_WALLPAPERS.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="dynamic-background-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
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

      <div className="absolute inset-0 bg-slate-950/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/10 to-slate-950/60" />
    </div>
  );
};
