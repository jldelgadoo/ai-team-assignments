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
- Vitest (tests de la lógica pura)
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

Este proyecto se desarrolló de forma asistida con **Kiro**, aprovechando varias de
sus capacidades:

- **Spec-driven development** — la funcionalidad se definió primero como
  especificación (requisitos → diseño → tareas) en
  [`.kiro/specs/ai-team-assignments/`](.kiro/specs/ai-team-assignments/), y la
  implementación se fue completando tarea a tarea.
- **Steering** — convenciones y contexto del proyecto viven en
  [`.kiro/steering/`](.kiro/steering/), de modo que las contribuciones siguen las
  mismas reglas de forma consistente.
- **Agente personalizado de confidencialidad** —
  [`.kiro/agents/confidentiality-reviewer.md`](.kiro/agents/confidentiality-reviewer.md)
  es un revisor de solo lectura que verifica que el repo use únicamente datos
  sintéticos, busca rastros de datos reales y valida los niveles de riesgo NIST. Su
  último informe está en [`docs/confidentiality-review.md`](docs/confidentiality-review.md)
  (veredicto: **APROBADO**).
- **Hook de type-check** — un hook en [`.kiro/hooks/`](.kiro/hooks/) ejecuta la
  verificación de tipos al guardar, para detectar errores de TypeScript de forma
  temprana.
- **Servidor MCP de PowerPoint** — el informe ejecutivo
  [`docs/Informe_Asignaciones.pptx`](docs/Informe_Asignaciones.pptx) (16:9, con
  tabla de carga y semáforo, gráfico de barras de foco por riesgo y casos de alto
  riesgo) se generó a partir de `public/seed.json` mediante el servidor MCP `ppt`
  configurado en [`.kiro/settings/mcp.json`](.kiro/settings/mcp.json).
- **Flujo con Git/GitHub** — cada entregable se integró mediante ramas y Pull
  Requests revisables, en lugar de commits directos a `main`.

Todo el contenido generado (nombres, casos de uso y cifras) es **sintético y
ficticio**; no contiene información real de ninguna organización.
