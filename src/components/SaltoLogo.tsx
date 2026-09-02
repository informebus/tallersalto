import React from 'react';

interface SaltoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SaltoLogo: React.FC<SaltoLogoProps> = ({
  className = 'w-10 h-10',
  size = 'md',
  showText = false,
}) => {
  const rawBase = import.meta.env?.BASE_URL || '/tallersalto/';
  const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const logoSvg = `${basePath}logo.svg`;
  const logoPng = `${basePath}logo.png`;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoPng}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.endsWith('logo.svg')) {
            target.src = logoSvg;
          }
        }}
        alt="Escudo de Salto - División Ómnibus"
        className="w-full h-full object-contain rounded-xl shadow-xs"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
