# Informe de Confidencialidad — AI Team Assignments

**Revisor:** agente `confidentiality-reviewer` (solo lectura)
**Fecha:** 22 de septiembre de 2026
**Alcance:** `public/seed.json` y el resto del repositorio.

## Veredicto: ✅ APROBADO

El proyecto usa exclusivamente datos sintéticos y no expone información real de
ninguna organización. No se recomienda ningún cambio.

---

## 1. Nombres de personas (`public/seed.json`)

Los 6 nombres son **ficticios, genéricos y diversos**, sin correspondencia con una
organización real:

- Lucía Marín — ML Engineer
- Diego Ferrán — Data Scientist
- Aisha Nassiri — MLOps Engineer
- Bruno Salgado — AI Product Manager
- Yuki Tanaka — Responsible AI Lead
- Elena Rossi — Prompt Engineer

Los roles son títulos genéricos de industria. ✔️

## 2. Casos de uso

Descripciones **genéricas y sintéticas**, sin nombres de productos, clientes ni
sistemas propietarios. Términos como "interno/interna" aparecen en contexto neutro
(p. ej. "documentación interna del equipo"), no como referencia a un sistema real. ✔️

## 3. Rastro de datos reales (escaneo del repositorio)

Sin hallazgos de organizaciones, sistemas internos, endpoints, IPs, credenciales,
tokens ni rutas privadas.

- Las únicas URLs encontradas son del **registro npm** en `package-lock.json`
  (dependencias, esperado).
- No hay direcciones IP, correos, secretos ni claves. ✔️

## 4. Clasificación de riesgo NIST (validez y coherencia)

Todos los valores son válidos (`bajo` | `medio` | `alto`) y **coherentes** con la
descripción:

| Caso | Riesgo | Coherencia |
|------|--------|-----------|
| c1 Asistente interno de documentación | bajo | ✔️ Impacto limitado, sin datos sensibles |
| c2 Resumen de tickets de soporte | bajo | ✔️ Uso interno, bajo impacto |
| c3 Priorización de leads comerciales | medio | ✔️ Scoring con supervisión y control de sesgos |
| c4 Detección de fraude en pagos | medio | ✔️ Clasificador con revisión manual |
| c5 Cribado automático de candidaturas | alto | ✔️ Decisiones de contratación; equidad/transparencia |
| c6 Triaje clínico asistido | alto | ✔️ Ámbito sanitario; validación y trazabilidad |

## Hallazgos que requieren cambio

Ninguno.

---

> Nota: el dominio que aparece en `git remote` es la pasarela de conexión del
> sandbox (infraestructura, no dato del proyecto), por lo que no se marca como hallazgo.
