# Architecture Decision Records (ADR) - Portal IT / Sistemas

## ADR-001: Selección de Stack Frontend & Estado
- **Estado**: Aceptado.
- **Contexto**: Se requiere una interfaz profesional, ágil, reactiva e inspirada en herramientas como Notion, Jira y Google Calendar.
- **Decisión**: React 19 con Vite, Tailwind CSS para estilos corporativos en tema oscuro (Slate/Charcoal) y claro, Lucide Icons, Date-fns, Recharts para métricas y componentes modulares altamente optimizados.
- **Consecuencia**: Alta velocidad de iteración, renderizado fluido y experiencia de usuario limpia sin sobrecarga.

## ADR-002: Persistencia y Tiempo Real con Firebase Firestore
- **Estado**: Aceptado.
- **Contexto**: La aplicación debe sincronizar en tiempo real tareas, incidencias, eventos de calendario y cambios para los usuarios operativos (Jefe de Sistemas y Analista IT).
- **Decisión**: Uso de Cloud Firestore mediante listeners `onSnapshot` desacoplados en servicios y un `AppContext` reactivo con soporte de fallback defensivo.
- **Consecuencia**: Cambios instantáneos reflejados entre usuarios sin recargar la página.

## ADR-003: Modelo de Autenticación y Perfiles para los dos Roles Iniciales
- **Estado**: Aceptado.
- **Contexto**: El sistema será usado inicialmente por dos personas: Jefe de Sistemas (admin) y Analista IT (analyst).
- **Decisión**: Integración con Firebase Auth con selector de cuenta rápida/demo para cambios de perfil ágiles, manteniendo el estado de usuario autenticado en Firestore (`/users`).
- **Consecuencia**: Seguridad estricta a nivel de reglas con máxima usabilidad durante el trabajo diario.

## ADR-004: Inmutabilidad de la Bitácora de Auditoría
- **Estado**: Aceptado.
- **Contexto**: Se requiere registrar todos los cambios técnicos, creación/modificación de tareas, incidencias y eventos para cumplimiento e historial técnico.
- **Decisión**: Registro automático en `/activityLogs` sin permisos de edición ni eliminación desde reglas de Firestore.
- **Consecuencia**: Trazabilidad completa e inalterable de la gestión del departamento.
