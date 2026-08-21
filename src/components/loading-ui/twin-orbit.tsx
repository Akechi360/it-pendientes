import React from 'react';

interface TwinOrbitProps {
  className?: string;
  /** Duración de una órbita completa. Por defecto 0.9s. */
  duration?: string;
}

/**
 * TwinOrbit — indicador de carga: dos puntos orbitando un centro común,
 * separados 180°. Hereda el color con `currentColor` (usa `bg-current`) y se
 * dimensiona con `className` (p. ej. `size-8` o `size-4.5`).
 */
export const TwinOrbit: React.FC<TwinOrbitProps> = ({ className = '', duration = '0.9s' }) => (
  <span
    role="status"
    aria-label="Cargando"
    className={`relative inline-block align-middle ${className}`}
  >
    <span className="absolute inset-0 animate-spin" style={{ animationDuration: duration }}>
      <span className="absolute left-1/2 top-0 h-[24%] w-[24%] -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute left-1/2 bottom-0 h-[24%] w-[24%] -translate-x-1/2 rounded-full bg-current opacity-50" />
    </span>
  </span>
);

export default TwinOrbit;
