import React from 'react';

interface LogoProps {
  /** Clases de tamaño del recuadro, p. ej. "w-10 h-10". */
  className?: string;
}

/**
 * Logo de Portal IT.
 * El PNG de origen es un app-icon (tile oscuro + hexágono con glow) apaisado y
 * con márgenes transparentes. Lo recortamos con un contenedor `overflow-hidden`
 * y escalamos la imagen para quedarnos SOLO con el hexágono/glow —sin la caja
 * oscura ni deformación—, de modo que se integre limpio al fondo de la app.
 */
export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10' }) => (
  <span
    className={`relative inline-flex items-center justify-center overflow-hidden rounded-[22%] shrink-0 ${className}`}
  >
    <img
      src="/logo-it.png"
      alt="Portal IT"
      draggable={false}
      className="h-[150%] w-auto max-w-none select-none"
    />
  </span>
);

export default Logo;
