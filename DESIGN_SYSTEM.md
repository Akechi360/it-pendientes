# IT Operations Command Center - Design System

## Filosofía
El diseño está pensado para administradores de sistemas, desarrolladores e infraestructura. Es técnico, sobrio, premium y confiable (inspirado en Linear, Raycast, Vercel). Prioriza la alta densidad de información y excelente legibilidad.

## Paleta y Semántica de Color
El sistema utiliza variables CSS (HSL) mapeadas en Tailwind CSS. Las escalas globales predeterminadas de Tailwind (slate, blue, red) se mantienen para micro-interacciones, pero las superficies y el texto usan los siguientes tokens:

### Superficies (Dark-first, Light Mode Funcional)
- **`bg-canvas`**: Fondo general de la aplicación.
- **`bg-surface`**: Paneles principales, modales y cards.
- **`bg-surface-raised`**: Hover states, dropdowns, y elementos elevados.
- **`bg-surface-hover`**: Estados interactivos secundarios.

### Texto
- **`text-content-primary`**: Títulos y métricas principales.
- **`text-content-secondary`**: Texto de cuerpo y metadata secundaria.
- **`text-content-muted`**: Borders, placeholders y placeholders inactivos.

### Colores de Estado (Usando escala nativa de Tailwind para mantener consistencia semántica)
- **Acción/Foco (Cyan)**: `cyan-400` (Dark) / `cyan-600` (Light). Interacciones principales y foco.
- **Crítico/Error (Rosa/Rojo)**: `rose-400` / `rose-500`. Sistemas caídos, SLA vencido, errores.
- **Advertencia (Ámbar)**: `amber-400` / `amber-500`. Renovaciones próximas, prioridad alta.
- **Éxito/Saludable (Verde)**: `emerald-400` / `emerald-500`. Completado, dentro del SLA.
- **Planificación (Violeta)**: `violet-400` / `violet-500`. Calendario, reuniones.

## Tipografía y Espaciado
- **Tipografía**: Font sans global (Inter/Geist) optimizada por `antialiased`.
- **Títulos**: 18px-22px (Text-lg a Text-xl), Font-semibold.
- **Métricas Clave**: 32px-42px, Font-bold.
- **Metadata**: 12px (Text-xs), Color secondary.
- **Radios**: `rounded-lg` (8px) para controles, `rounded-xl` (12px) para paneles principales.
- **Micro-interacciones**: Transiciones de 150ms (`duration-150`) a 200ms usando opacity y borders en hover/focus.

## Reglas de Integridad
1. Los componentes deben estar conectados **únicamente** a los servicios de Supabase actuales y los contextos (`useApp`, `useAuth`).
2. Se debe garantizar accesibilidad (AA contraste) e incluir foco visible (`focus:ring-2 focus:ring-cyan-500/50`).
3. Nunca mostrar datos *hardcodeados*. Siempre utilizar esqueletos de carga (`LoadingSkeleton`) o empty states cuando corresponda.
