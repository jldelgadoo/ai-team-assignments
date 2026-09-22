# Plan de implementación — AI Team Assignments

- [ ] 1. Andamiaje del proyecto (React + TypeScript + Vite)
  - Inicializar proyecto Vite con plantilla `react-ts` en la raíz del repo.
  - Configurar `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
  - Limpiar plantilla por defecto y dejar `App` mínimo renderizando.
  - _Requisitos: 6.2, 6.4_

- [ ] 2. Tipos y datos sintéticos
  - [ ] 2.1 Definir tipos en `src/types.ts` (`Persona`, `CasoUso`, `Asignacion`, `RiesgoNIST`, `SeedData`).
    - _Requisitos: modelo de datos, 1.2_
  - [ ] 2.2 Crear `public/seed.json` con datos ficticios: ≥5 personas, ≥4 casos de uso cubriendo `bajo`/`medio`/`alto` (con `riesgoNIST` y descripción), ≥8 asignaciones.
    - _Requisitos: 1.1, 1.3, 1.5_

- [ ] 3. Estado global y carga del seed
  - [ ] 3.1 Implementar `src/state/store.tsx` con Context + `useReducer` (acciones LOAD_OK/LOAD_ERROR/ADD/UPDATE/DELETE).
    - _Requisitos: 3.2, 4.6, 5.4_
  - [ ] 3.2 Cargar `seed.json` al iniciar con manejo de error (`status: loading|ready|error`).
    - _Requisitos: 1.1, 1.4_

- [ ] 4. Lógica de cálculo pura (`src/lib/`)
  - [ ] 4.1 `workload.ts`: `cargaPorPersona` y `estadoSemaforo` (<70 holgura, 70–100 ok, >100 sobrecarga).
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.7_
  - [ ] 4.2 `risk.ts`: `capacidadPorRiesgo` (agrega por nivel, niveles ausentes = 0).
    - _Requisitos: 5.1, 5.3_
  - [ ] 4.3 `validation.ts`: validación de asignación (obligatorios, dedicación 1–100, `hasta >= desde`).
    - _Requisitos: 3.4, 3.5, 3.6_

- [ ] 5. Componentes reutilizables
  - [ ] 5.1 `RiskBadge` (etiqueta/color por nivel NIST) y `TrafficLight` (semáforo).
    - _Requisitos: 2.2, 4.2, 4.3, 4.4_
  - [ ] 5.2 `EmptyState` y `ErrorState`.
    - _Requisitos: 1.4, 2.3_

- [ ] 6. Navegación y layout (`App`, `Nav`)
  - Implementar `App` con provider de estado, layout y `Nav` entre Tabla/Resumen/Foco.
  - Renderizar `ErrorState` cuando `status === 'error'`.
  - _Requisitos: 6.1, 6.2, 6.3, 1.4_

- [ ] 7. Tabla de asignaciones (`AssignmentsTable`)
  - Mostrar persona, rol, caso de uso, `RiskBadge`, % dedicación y rango de fechas.
  - Filtro por persona y por riesgo; orden por columnas clave.
  - Botón "Nueva asignación" y acciones Editar/Eliminar (con confirmación) por fila.
  - Estado vacío cuando no hay asignaciones.
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Formulario crear/editar (`AssignmentForm`)
  - Selects de persona y caso de uso; campos dedicación, desde, hasta.
  - Validación con mensajes por campo (usa `validation.ts`); Guardar/Cancelar.
  - Modo creación (añade) y edición (precarga y actualiza la misma asignación).
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 9. Resumen de carga por persona (`WorkloadSummary`)
  - Tarjetas/lista por persona con % total, `TrafficLight` y etiqueta de estado.
  - Ordenar por carga descendente; recálculo automático ante cambios.
  - _Requisitos: 4.1, 4.5, 4.6_

- [ ] 10. Foco del equipo por riesgo (`TeamFocus`)
  - Barras por nivel (bajo/medio/alto) con % agregado y proporción; niveles en cero visibles.
  - Nota de atribución a NIST AI RMF 1.0; recálculo automático ante cambios.
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Estilos y responsive
  - `styles.css` con paleta semántica (riesgo/semáforo) y layout usable en escritorio y anchos reducidos.
  - _Requisitos: 6.3_

- [ ] 12. Verificación final
  - Ejecutar `npm run build` (type-check) y comprobar manualmente las vistas y el flujo crear/editar/eliminar.
  - _Requisitos: todos_

## Ampliaciones incorporadas

- [x] 13. Persistencia en `localStorage` con carga inicial y botón «Reiniciar datos».
- [x] 14. CRUD de personas y casos de uso (vista «Equipo y casos») con validación y
  borrado protegido cuando existen asignaciones que los referencian.
- [x] 15. Tests de la lógica pura con Vitest (`workload`, `risk`, `validation`) y
  script `npm test`.
