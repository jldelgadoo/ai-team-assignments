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
- Sin backend: los datos se cargan desde `public/seed.json` y viven en memoria
  durante la sesión.

## Vistas

1. **Asignaciones** — tabla con persona, rol, caso de uso, badge de riesgo NIST,
   % de dedicación y fechas. Filtros por persona y por riesgo. Crear / editar /
   eliminar asignaciones.
2. **Carga por persona** — dedicación total por persona con semáforo:
   - Holgura: `< 70%`
   - OK: `70–100%`
   - Sobrecarga: `> 100%`
3. **Foco del equipo** — capacidad agregada del equipo por nivel de riesgo NIST.

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
```

## Notas de diseño

- La carga de una persona es la **suma simple** de la dedicación de todas sus
  asignaciones (no se pondera el solapamiento de fechas).
- Personas y casos de uso son fijos en esta versión; sólo se editan asignaciones.
- No hay persistencia: al recargar la página el estado vuelve al `seed.json`.
- La clasificación de riesgo es una simplificación cualitativa de 3 niveles
  inspirada en NIST AI RMF, aplicada a datos ficticios.

La especificación completa (requisitos, diseño y tareas) está en
[`.kiro/specs/ai-team-assignments/`](.kiro/specs/ai-team-assignments/).
