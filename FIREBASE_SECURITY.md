# Modelo de Seguridad y Reglas de Firebase (Firestore & Storage)

## 1. Modelo de Amenazas y Filosofía
El Portal IT / Sistemas implementa un modelo de seguridad basado en **Zero Trust** y **Attribute-Based Access Control (ABAC)**.

### Principios Fundamentales:
1. **Acceso Autenticado Obligatorio**: No se permite ninguna operación de lectura o escritura a usuarios no autenticados.
2. **Aislamiento por Rol y Organización**: Los recursos pertenecen a una organización/workspace (`organizationId`).
3. **Roles Declarativos**:
   - `admin` (Jefe de Sistemas): Control total, administración de usuarios, eliminación lógica y acceso a registros de auditoría.
   - `analyst` (Analista IT / Operativo): Creación y edición operativa de tareas, incidencias, documentación, reuniones, activos y renovaciones.
4. **Registros Inmutables**: La colección `/activityLogs` (Bitácora de auditoría) es estrictamente inmutable (`allow update: if false`, `allow delete: if false`).

## 2. Reglas de Firestore
Las reglas definidas en `firestore.rules` aseguran:
- `users`: Lectura autenticada, edición propia o por administradores.
- `tasks`, `projects`, `incidents`, `meetings`, `documents`, `assets`, `renewals`: Lectura y escritura autenticada, eliminación restringida a administradores.
- `notifications`: Lectura y actualización limitada al destinatario (`userId`).
- `activityLogs`: Creación permitida para auditoría; actualización e inspección con restricciones inmutables.

## 3. Despliegue de Reglas
Para desplegar las reglas a producción:
```bash
firebase deploy --only firestore:rules
```
O mediante la herramienta integrada `deploy_firebase`.
