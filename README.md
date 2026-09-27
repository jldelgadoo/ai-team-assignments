# AI Team Assignments

Tablero web de **solo visibilidad** para observar las asignaciones de un equipo de
IA: quién forma parte del equipo, en qué caso de uso trabaja, con qué porcentaje de
dedicación y en qué rango de fechas. **No es una herramienta de gestión de
proyectos.**

Todos los datos son **ficticios**. El nivel de riesgo de cada caso de uso se
clasifica siguiendo el marco público **NIST AI Risk Management Framework (AI RMF
1.0)** en tres niveles: `bajo`, `medio`, `alto`.

## Stack

- React 18 + TypeScript
- Vite
- Vitest + **fast-check** (tests por ejemplos y basados en propiedades de la lógica pura)
- Sin backend: los datos iniciales se cargan desde `public/seed.json` y los cambios
  se guardan en el navegador (`localStorage`).

## Vistas

1. **Asignaciones** — tabla con persona, rol, caso de uso, badge de riesgo NIST,
   % de dedicación y fechas. Filtros por persona y por riesgo. Crear / editar /
   eliminar asignaciones.
2. **Carga por persona** — dedicación total por persona con semáforo:
   - Holgura: `< 70%`
   - OK: `70–100%`
   - Sobrecarga: `> 100%`
3. **Foco del equipo** — capacidad agregada del equipo por nivel de riesgo NIST.
4. **Equipo y casos** — alta / edición / baja de personas y de casos de uso. No se
   permite eliminar una persona o un caso que aún tenga asignaciones.

## Modelo de datos

- **Persona**: `id`, `nombre`, `rol`
- **CasoUso**: `id`, `nombre`, `riesgoNIST` (`bajo` | `medio` | `alto`), `descripcion`
- **Asignacion**: `id`, `personaId`, `casoUsoId`, `dedicacionPct`, `desde`, `hasta`

## Uso

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # type-check + build de producción
npm run preview  # previsualizar el build
npm test         # tests de la lógica (Vitest)
```

## Notas de diseño

- La carga de una persona es la **suma simple** de la dedicación de todas sus
  asignaciones (no se pondera el solapamiento de fechas).
- **Persistencia:** los cambios (asignaciones, personas y casos de uso) se guardan
  en `localStorage`. Al abrir la app se restauran desde ahí; si no hay nada
  guardado, se parte del `seed.json`. El botón **«Reiniciar datos»** borra lo
  guardado y vuelve al seed original.
- La clasificación de riesgo es una simplificación cualitativa de 3 niveles
  inspirada en NIST AI RMF, aplicada a datos ficticios.

La especificación completa (requisitos, diseño y tareas) está en
[`.kiro/specs/ai-team-assignments/`](.kiro/specs/ai-team-assignments/).

## Cómo se construyó con Kiro

Este proyecto se desarrolló de forma asistida con **Kiro**. A continuación, cómo se
demuestra cada lección del *Kiro University Challenge*:

| # | Lección | Evidencia en el repo |
|---|---------|----------------------|
| 1 | **Spec-driven development** | [`.kiro/specs/ai-team-assignments/`](.kiro/specs/ai-team-assignments/): requisitos (EARS) → diseño → tareas, completadas una a una. |
| 2 | **Steering** | [`.kiro/steering/product.md`](.kiro/steering/product.md): contexto, stack, modelo de datos y regla de confidencialidad. |
| 3 | **Hooks** | [`.kiro/hooks/typecheck-on-save.json`](.kiro/hooks/): type-check de TypeScript al guardar. |
| 4 | **Property-based testing** (IDE) | `src/lib/*.pbt.test.ts` + [`src/lib/arbitraries.ts`](src/lib/arbitraries.ts): 17 propiedades con **fast-check** ligadas a los requisitos EARS (ver Requisito 9). |
| 5 | **Powers** | [`powers/confidentiality-guard/`](powers/confidentiality-guard/): el revisor de confidencialidad empaquetado como Power (Agent Plugins v1.0.0). |
| 6 | **MCP** | [`.kiro/settings/mcp.json`](.kiro/settings/mcp.json): servidor `ppt` que generó [`docs/Informe_Asignaciones.pptx`](docs/Informe_Asignaciones.pptx) desde `public/seed.json`. |
| 7 | **Custom agents** | [`.kiro/agents/confidentiality-reviewer.md`](.kiro/agents/confidentiality-reviewer.md): revisor de solo lectura; informe en [`docs/confidentiality-review.md`](docs/confidentiality-review.md) (**APROBADO**). |
| B1 | **Kiro Web + cloud** (bonus) | El proyecto se creó y desarrolló en **Kiro Web** (sesiones y configuración en la nube); la lección 4 (IDE-only) se hizo clonando el repo al **IDE de escritorio**. |
| B2 | **Empaquetar un Power** (bonus) | [`powers/confidentiality-guard/plugin.json`](powers/confidentiality-guard/plugin.json) + skill con `references/` y `scripts/`. |

### Detalle de las capacidades

- **Spec-driven development** — la funcionalidad se definió primero como
  especificación (requisitos → diseño → tareas) y la implementación se completó
  tarea a tarea.
- **Steering** — convenciones y contexto del proyecto viven en `.kiro/steering/`,
  de modo que las contribuciones siguen las mismas reglas de forma consistente.
- **Property-based testing** — además de los tests por ejemplos, la lógica pura de
  `src/lib/` se verifica con **propiedades universales** (fast-check sobre Vitest):
  invariantes de carga por persona, agregación por riesgo NIST y validación de
  formularios. Cada propiedad deriva de un requisito EARS. Esta lección es
  exclusiva del IDE de escritorio, así que el repo (creado en Kiro Web) se clonó al
  IDE local para desarrollarla.
- **Powers** — el revisor de confidencialidad se reempaqueta como Power portable
  (`powers/confidentiality-guard/`) conforme a Agent Plugins v1.0.0, instalable en
  cualquier proyecto que maneje datos de ejemplo.
- **MCP** — el informe ejecutivo `docs/Informe_Asignaciones.pptx` (16:9, con tabla
  de carga y semáforo, gráfico de foco por riesgo y casos de alto riesgo) se generó
  a partir de `public/seed.json` mediante el servidor MCP `ppt`.
- **Custom agents** — el agente `confidentiality-reviewer` verifica que el repo use
  únicamente datos sintéticos, busca rastros de datos reales y valida los niveles
  de riesgo NIST (último veredicto: **APROBADO**).
- **Hooks** — un hook ejecuta la verificación de tipos al guardar.
- **Flujo con Git/GitHub** — cada entregable se integró mediante ramas y Pull
  Requests revisables, en lugar de commits directos a `main`.

### Pruebas

```bash
npm test    # 35 tests: 18 por ejemplos + 17 basados en propiedades (fast-check)
```

Todo el contenido generado (nombres, casos de uso y cifras) es **sintético y
ficticio**; no contiene información real de ninguna organización.
