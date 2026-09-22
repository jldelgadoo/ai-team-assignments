---
inclusion: always
---

# AI Team Assignments — Contexto del proyecto

## Qué es
Tablero simple para visualizar las asignaciones y tiempos de un equipo de IA.
NO es gestión de proyectos: solo visibilidad de quién está en qué caso de uso,
cuánto % de dedicación y en qué rango de fechas, más vistas de carga y foco.

## Stack y convenciones
- React + TypeScript + Vite. Sin backend.
- Estado en React context (`src/state/store.tsx`) con persistencia en localStorage.
- Datos iniciales en `public/seed.json`.
- Lógica pura y testeable en `src/lib/` (risk, validation, workload) con tests `*.test.ts`.
- Componentes en `src/components/`, un componente por archivo, tipados con `src/types.ts`.
- Nombres de UI y datos en español.

## Modelo de datos (no cambiar sin actualizar types.ts)
- Persona: id, nombre, rol.
- CasoUso: id, nombre, riesgoNIST ("bajo" | "medio" | "alto"), descripcion.
- Asignacion: id, personaId, casoUsoId, dedicacionPct (0-100), desde, hasta (ISO date).

## Reglas de carga de trabajo
- Carga de una persona = suma de dedicacionPct de sus asignaciones vigentes.
- Semáforo: holgura < 70%, ok 70-100%, sobrecarga > 100%.

## Regla de confidencialidad (OBLIGATORIA)
- TODOS los datos son sintéticos y ficticios. Nombres y casos inventados.
- Usar marcos públicos (NIST AI RMF, ISO 42001, EU AI Act) para clasificar riesgo.
- PROHIBIDO incluir datos reales de cualquier organización: nombres reales,
  sistemas internos, endpoints, IPs, credenciales o rutas privadas.
