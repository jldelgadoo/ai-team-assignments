# Diseño — AI Team Assignments

## Visión general

Aplicación web **cliente puro** (sin backend) construida con **React + TypeScript +
Vite**. Carga datos sintéticos desde `seed.json`, los mantiene en memoria durante la
sesión y permite crear/editar/eliminar asignaciones. Ofrece tres vistas de
visibilidad: tabla de asignaciones, resumen de carga por persona con semáforo, y
foco del equipo por nivel de riesgo NIST AI RMF.

No hay persistencia entre sesiones: al recargar, el estado vuelve al `seed.json`.
(Opcionalmente, en una iteración futura, se podría persistir en `localStorage`; se
deja fuera del alcance inicial.)

## Arquitectura

```
┌───────────────────────────────────────────────┐
│                    App.tsx                      │
│  - Estado global (personas, casos, asignac.)    │
│  - Navegación entre vistas                      │
└───────────────┬───────────────────────────────┘
                │ (Context / props)
   ┌────────────┼───────────────┬──────────────────┐
   ▼            ▼               ▼                  ▼
Tabla de    Formulario     Resumen por        Foco por
asignac.    (crear/editar) persona (semáforo) riesgo NIST
   │            │               │                  │
   └────────────┴───────┬───────┴──────────────────┘
                        ▼
            selectors / lógica de cálculo (puro TS)
                        ▲
                        │
                    seed.json
```

- **Estado**: un único store en memoria elevado en `App` mediante React Context +
  `useReducer` (o `useState` con hooks derivados). El estado contiene `personas`,
  `casosUso` y `asignaciones`.
- **Lógica de cálculo**: funciones puras en `lib/` (sin dependencias de React) para
  poder razonarlas y probarlas de forma aislada.
- **Datos**: `seed.json` importado al arrancar y volcado al estado inicial.

## Modelo de datos (TypeScript)

```ts
// src/types.ts
export type RiesgoNIST = 'bajo' | 'medio' | 'alto';

export interface Persona {
  id: string;
  nombre: string;
  rol: string;
}

export interface CasoUso {
  id: string;
  nombre: string;
  riesgoNIST: RiesgoNIST;
  descripcion: string;
}

export interface Asignacion {
  id: string;
  personaId: string;
  casoUsoId: string;
  dedicacionPct: number;   // 1..100
  desde: string;           // ISO date 'YYYY-MM-DD'
  hasta: string;           // ISO date 'YYYY-MM-DD'
}

export interface SeedData {
  personas: Persona[];
  casosUso: CasoUso[];
  asignaciones: Asignacion[];
}
```

### Clasificación de riesgo NIST AI RMF
El campo `riesgoNIST` refleja una clasificación cualitativa inspirada en el
**NIST AI Risk Management Framework (AI RMF 1.0)**, marco público que orienta la
identificación y gestión de riesgos de sistemas de IA. En esta app se usa una escala
simplificada de tres niveles (`bajo`, `medio`, `alto`) puramente para fines de
visualización de datos ficticios. Se mostrará una nota de atribución al marco en la
vista de foco del equipo.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `App` | Estado global, provider de contexto, layout y navegación entre vistas. |
| `Nav` | Cambio entre vistas (Tabla / Resumen / Foco). |
| `AssignmentsTable` | Req. 2 — lista de asignaciones con datos resueltos, badges de riesgo, orden/filtro, acciones editar/eliminar. |
| `AssignmentForm` | Req. 3 — crear/editar asignación con validación. Modal o panel lateral. |
| `RiskBadge` | Etiqueta de color por nivel de riesgo NIST (reutilizable). |
| `WorkloadSummary` | Req. 4 — carga total por persona con semáforo. |
| `TrafficLight` | Indicador de semáforo (holgura/ok/sobrecarga) reutilizable. |
| `TeamFocus` | Req. 5 — capacidad agregada por nivel de riesgo, con barras. |
| `EmptyState` | Estado vacío reutilizable. |
| `ErrorState` | Mensaje de error de carga (Req. 1.4). |

## Estado y flujo de datos

```ts
// src/state/store.tsx  (Context + useReducer)
interface AppState {
  personas: Persona[];
  casosUso: CasoUso[];
  asignaciones: Asignacion[];
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

type Action =
  | { type: 'LOAD_OK'; payload: SeedData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Asignacion }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Asignacion }
  | { type: 'DELETE_ASSIGNMENT'; id: string };
```

- La creación/edición/borrado sólo afecta a `asignaciones` (personas y casos de uso
  son fijos en esta versión).
- Los resúmenes (Req. 4 y 5) se derivan con selectores puros a partir del estado, de
  modo que se recalculan automáticamente en cada render.

## Lógica de cálculo (funciones puras — `src/lib/`)

```ts
// carga total por persona = suma de dedicacionPct de sus asignaciones
function cargaPorPersona(asignaciones, personas): { persona, totalPct, estado }[]

// estado semáforo
function estadoSemaforo(totalPct: number): 'holgura' | 'ok' | 'sobrecarga'
//  < 70        -> 'holgura'
//  70..100     -> 'ok'
//  > 100       -> 'sobrecarga'

// capacidad agregada por nivel de riesgo NIST
function capacidadPorRiesgo(asignaciones, casosUso):
  Record<RiesgoNIST, number>   // suma de dedicacionPct por nivel; niveles ausentes = 0
```

### Decisión: cálculo de carga y solapamiento temporal
Para la versión inicial, la carga total de una persona es la **suma simple de
`dedicacionPct` de todas sus asignaciones**, sin ponderar por solapamiento de
fechas. Esto es lo esperado por el semáforo (>100% = sobrecarga aunque las fechas no
coincidan). El solapamiento temporal ponderado se documenta como posible mejora
futura, no incluida en el alcance. (Req. 4.7)

## Diseño de las vistas

### 1. Tabla de asignaciones (Req. 2)
- Columnas: Persona · Rol · Caso de uso · Riesgo (badge) · % Dedicación · Desde · Hasta · Acciones.
- Controles: filtro por persona (select) y por riesgo (select); orden por columnas clave.
- Botón "Nueva asignación" abre `AssignmentForm` en modo creación.
- Cada fila: acciones **Editar** (abre form precargado) y **Eliminar** (con confirmación).
- Estado vacío cuando no hay asignaciones.

### 2. Formulario crear/editar (Req. 3)
- Campos: Persona (select), Caso de uso (select), Dedicación % (number 1–100),
  Desde (date), Hasta (date).
- Validación en cliente: campos obligatorios, `dedicacionPct` 1–100, `hasta >= desde`.
- Mensajes de validación por campo; botón Guardar deshabilitado o bloqueado hasta
  que el formulario es válido; botón Cancelar descarta cambios.
- Reutilizado para crear y editar (precarga valores en edición).

### 3. Resumen por persona con semáforo (Req. 4)
- Lista/tarjetas por persona: nombre, rol, % total, `TrafficLight` y etiqueta de estado.
- Colores: **holgura** azul/verde-claro, **ok** verde, **sobrecarga** rojo.
- Ordenado de mayor a menor carga para destacar sobrecargas.

### 4. Foco del equipo por riesgo (Req. 5)
- Tres barras (bajo/medio/alto) con el % agregado y su proporción sobre el total.
- Cada barra usa el mismo código de color que `RiskBadge`.
- Nota de atribución: "Clasificación basada en NIST AI RMF 1.0".

## Estructura de carpetas propuesta

```
ai-team-assignments/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ public/
│  └─ seed.json                  # datos sintéticos
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ types.ts
   ├─ state/
   │  └─ store.tsx               # Context + useReducer + carga del seed
   ├─ lib/
   │  ├─ workload.ts             # cargaPorPersona, estadoSemaforo
   │  ├─ risk.ts                 # capacidadPorRiesgo
   │  └─ validation.ts           # validación de asignaciones
   ├─ components/
   │  ├─ Nav.tsx
   │  ├─ AssignmentsTable.tsx
   │  ├─ AssignmentForm.tsx
   │  ├─ WorkloadSummary.tsx
   │  ├─ TeamFocus.tsx
   │  ├─ RiskBadge.tsx
   │  ├─ TrafficLight.tsx
   │  ├─ EmptyState.tsx
   │  └─ ErrorState.tsx
   └─ styles.css
```

## Estilos
- CSS plano (o CSS Modules) para mantener el proyecto ligero y sin dependencias de
  UI pesadas. Paleta simple con colores semánticos para riesgo y semáforo.

## Manejo de errores
- Carga del seed envuelta en try/catch; ante fallo se pone `status: 'error'` y se
  renderiza `ErrorState` (Req. 1.4).
- Validación del formulario evita estados inválidos en el store (Req. 3.4–3.6).

## Estrategia de pruebas
- Pruebas unitarias de las funciones puras en `src/lib/` (semáforo, carga, capacidad
  por riesgo, validación) con **Vitest**. *(Solo si se solicita; no se añaden por
  defecto.)*
- Verificación manual del flujo en las tres vistas.

## Decisiones y supuestos
1. Sin backend ni persistencia entre recargas (el estado parte siempre del seed).
2. Personas y casos de uso son fijos en esta versión; sólo las asignaciones se editan.
3. Carga = suma simple de `dedicacionPct` (sin ponderar solapamiento de fechas).
4. `riesgoNIST` es una simplificación cualitativa de tres niveles inspirada en NIST
   AI RMF, aplicada a datos ficticios y con nota de atribución en la UI.
5. IDs generados con `crypto.randomUUID()` al crear asignaciones.
