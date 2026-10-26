import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Importamos las imágenes directamente para que Vite las procese y empaquete con la ruta correcta
import imgPrincipal from '../../public/fondos/principal.jpg';
import imgFoto2 from '../../public/fondos/foto2.jpeg';
import img1044 from '../../public/fondos/1044.jpg';
import img1062 from '../../public/fondos/1062.webp';
import img1046 from '../../public/fondos/1046.jpg';
import imgHim002 from '../../public/fondos/him002.webp';
import imgMicro from '../../public/fondos/micro.jpg';
import imgFoto6 from '../../public/fondos/foto6.jpeg';

const BUS_WALLPAPERS = [
  imgPrincipal,
  imgFoto2,
  img1044,
  img1062,
  img1046,
  imgHim002,
  imgMicro,
  imgFoto6
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
