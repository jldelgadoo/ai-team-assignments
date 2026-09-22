# Requisitos — AI Team Assignments

## Introducción

**AI Team Assignments** es una aplicación web de **solo visibilidad** (no gestión de
proyectos) para observar cómo está asignado un equipo de IA: quién forma parte del
equipo, en qué caso de uso de IA trabaja cada persona, con qué porcentaje de
dedicación y en qué rango de fechas.

La aplicación es **cliente puro** (sin backend). Los datos son **sintéticos y
ficticios** (personas y casos de uso inventados) y se cargan desde un `seed.json`.
El nivel de riesgo de cada caso de uso se clasifica siguiendo el marco público
**NIST AI Risk Management Framework (AI RMF 1.0)** en tres niveles: `bajo`, `medio`,
`alto`.

Stack objetivo: **React + TypeScript + Vite**.

### Alcance
- **Dentro de alcance:** visualizar y editar asignaciones en memoria durante la
  sesión, resúmenes de carga y foco por riesgo.
- **Fuera de alcance:** autenticación, persistencia en servidor, gestión de tareas
  o proyectos, notificaciones, control de acceso por roles.

### Modelo de datos (referencia)
- **Persona**: `id`, `nombre`, `rol`
- **CasoUso**: `id`, `nombre`, `riesgoNIST` (`bajo` | `medio` | `alto`), `descripcion`
- **Asignacion**: `id`, `personaId`, `casoUsoId`, `dedicacionPct`, `desde`, `hasta`

---

## Requisito 1 — Cargar datos sintéticos desde seed

**Historia de usuario:** Como usuario del tablero, quiero que la app cargue un
conjunto de datos ficticios al iniciar, para explorar la herramienta sin
configurar nada.

### Criterios de aceptación
1. CUANDO la aplicación se inicia, ENTONCES el sistema DEBERÁ cargar personas,
   casos de uso y asignaciones desde `seed.json`.
2. CUANDO se cargan los casos de uso, ENTONCES el sistema DEBERÁ asignar a cada uno
   un `riesgoNIST` con valor `bajo`, `medio` o `alto`.
3. EL sistema DEBERÁ contener únicamente datos ficticios (nombres de personas y
   casos de uso inventados), sin datos reales ni personales.
4. SI el `seed.json` no puede cargarse o es inválido, ENTONCES el sistema DEBERÁ
   mostrar un mensaje de error legible en lugar de una pantalla en blanco.
5. EL seed DEBERÁ incluir al menos 5 personas, al menos 4 casos de uso que cubran
   los tres niveles de riesgo, y al menos 8 asignaciones.

---

## Requisito 2 — Tabla de asignaciones

**Historia de usuario:** Como usuario, quiero ver todas las asignaciones en una
tabla, para entender de un vistazo quién trabaja en qué y cuándo.

### Criterios de aceptación
1. CUANDO se muestra la vista de tabla, ENTONCES el sistema DEBERÁ listar cada
   asignación con: nombre de persona, nombre del caso de uso, % de dedicación y el
   rango de fechas (`desde` – `hasta`).
2. CUANDO se muestra un caso de uso en la tabla, ENTONCES el sistema DEBERÁ indicar
   visualmente su nivel de riesgo NIST (etiqueta/color).
3. CUANDO no existen asignaciones, ENTONCES el sistema DEBERÁ mostrar un estado
   vacío explicativo en lugar de una tabla vacía sin contexto.
4. EL sistema DEBERÁ permitir ordenar o filtrar la tabla al menos por persona y por
   nivel de riesgo.
5. CUANDO el usuario selecciona editar o eliminar una fila, ENTONCES el sistema
   DEBERÁ ofrecer esas acciones desde la propia tabla.

---

## Requisito 3 — Crear y editar asignaciones

**Historia de usuario:** Como usuario, quiero crear y editar asignaciones mediante
un formulario, para mantener el tablero actualizado durante la sesión.

### Criterios de aceptación
1. CUANDO el usuario abre el formulario de creación, ENTONCES el sistema DEBERÁ
   permitir seleccionar una persona y un caso de uso de listas existentes, e
   introducir `dedicacionPct`, `desde` y `hasta`.
2. CUANDO el usuario guarda una asignación válida, ENTONCES el sistema DEBERÁ
   añadirla al estado y reflejarla inmediatamente en la tabla y los resúmenes.
3. CUANDO el usuario edita una asignación existente, ENTONCES el sistema DEBERÁ
   precargar los valores actuales y guardar los cambios sobre la misma asignación.
4. SI `dedicacionPct` no es un número entre 1 y 100, ENTONCES el sistema DEBERÁ
   impedir el guardado y mostrar un mensaje de validación.
5. SI la fecha `hasta` es anterior a la fecha `desde`, ENTONCES el sistema DEBERÁ
   impedir el guardado y mostrar un mensaje de validación.
6. SI algún campo obligatorio (persona, caso de uso, fechas, dedicación) está
   vacío, ENTONCES el sistema DEBERÁ impedir el guardado y señalar el campo.
7. CUANDO el usuario cancela el formulario, ENTONCES el sistema DEBERÁ descartar los
   cambios sin modificar el estado.

---

## Requisito 4 — Resumen de carga por persona con semáforo

**Historia de usuario:** Como responsable del equipo, quiero ver la carga total de
cada persona con un indicador de semáforo, para detectar holguras y sobrecargas.

### Criterios de aceptación
1. CUANDO se muestra el resumen por persona, ENTONCES el sistema DEBERÁ calcular la
   dedicación total de cada persona como la suma de `dedicacionPct` de sus
   asignaciones.
2. CUANDO la dedicación total de una persona es menor a 70%, ENTONCES el sistema
   DEBERÁ marcarla como **holgura** (indicador verde/azul según diseño).
3. CUANDO la dedicación total está entre 70% y 100% inclusive, ENTONCES el sistema
   DEBERÁ marcarla como **ok**.
4. CUANDO la dedicación total supera el 100%, ENTONCES el sistema DEBERÁ marcarla
   como **sobrecarga** (indicador rojo).
5. EL sistema DEBERÁ mostrar el porcentaje total numérico junto al indicador de
   semáforo de cada persona.
6. CUANDO cambia una asignación (alta, edición o baja), ENTONCES el resumen DEBERÁ
   recalcularse automáticamente.
7. EL criterio de solapamiento de fechas para el cálculo de carga DEBERÁ estar
   documentado en el diseño (por defecto: suma de todas las asignaciones activas
   sin ponderar solapamiento temporal).

---

## Requisito 5 — Foco del equipo: capacidad por nivel de riesgo NIST

**Historia de usuario:** Como responsable, quiero ver cómo se distribuye la
dedicación del equipo por nivel de riesgo NIST, para entender en qué se concentra
el esfuerzo.

### Criterios de aceptación
1. CUANDO se muestra la vista de foco del equipo, ENTONCES el sistema DEBERÁ agregar
   la dedicación total por nivel de riesgo NIST (`bajo`, `medio`, `alto`).
2. EL sistema DEBERÁ representar la distribución de forma visual (barras o
   proporciones) además del valor numérico.
3. CUANDO no hay asignaciones en un nivel de riesgo, ENTONCES el sistema DEBERÁ
   mostrar ese nivel con valor cero en lugar de omitirlo.
4. CUANDO cambia una asignación, ENTONCES el foco por riesgo DEBERÁ recalcularse
   automáticamente.
5. EL sistema DEBERÁ mostrar el marco de referencia (NIST AI RMF) como fuente de la
   clasificación de riesgo.

---

## Requisito 6 — Navegación y experiencia base

**Historia de usuario:** Como usuario, quiero moverme entre las distintas vistas
con claridad, para acceder a la información que necesito.

### Criterios de aceptación
1. EL sistema DEBERÁ ofrecer navegación entre las vistas: Tabla de asignaciones,
   Resumen por persona y Foco del equipo.
2. EL sistema DEBERÁ ser una aplicación de una sola página construida con React +
   TypeScript + Vite.
3. EL sistema DEBERÁ ser usable en pantallas de escritorio y adaptarse
   razonablemente a anchos reducidos.
4. EL sistema NO DEBERÁ requerir backend ni conexión a servicios externos para
   funcionar.


---

## Requisito 7 — Persistencia local de los cambios

**Historia de usuario:** Como usuario, quiero que mis cambios se conserven al
recargar la página, para no perder el trabajo de la sesión.

### Criterios de aceptación
1. CUANDO el usuario crea, edita o elimina datos, ENTONCES el sistema DEBERÁ
   guardar el estado en `localStorage`.
2. CUANDO la aplicación se inicia y existe estado guardado válido, ENTONCES el
   sistema DEBERÁ restaurarlo en lugar de recargar el `seed.json`.
3. SI no hay estado guardado (o es inválido), ENTONCES el sistema DEBERÁ partir del
   `seed.json`.
4. CUANDO el usuario pulsa «Reiniciar datos» y confirma, ENTONCES el sistema DEBERÁ
   borrar lo guardado y restaurar los datos originales del `seed.json`.
5. SI `localStorage` no está disponible, ENTONCES el sistema DEBERÁ seguir
   funcionando en memoria sin fallar.

---

## Requisito 8 — Gestión de personas y casos de uso

**Historia de usuario:** Como responsable, quiero dar de alta, editar y eliminar
personas y casos de uso, para mantener actualizado el catálogo del equipo.

### Criterios de aceptación
1. EL sistema DEBERÁ ofrecer una vista para gestionar personas y casos de uso.
2. CUANDO el usuario crea o edita una persona, ENTONCES el sistema DEBERÁ exigir
   `nombre` y `rol` no vacíos.
3. CUANDO el usuario crea o edita un caso de uso, ENTONCES el sistema DEBERÁ exigir
   `nombre`, un `riesgoNIST` válido (`bajo`|`medio`|`alto`) y `descripcion`.
4. SI el usuario intenta eliminar una persona o un caso de uso con asignaciones
   asociadas, ENTONCES el sistema DEBERÁ impedirlo e informar del motivo.
5. CUANDO se modifican personas o casos de uso, ENTONCES las vistas dependientes
   (tabla, resúmenes) DEBERÁN reflejar los cambios.
