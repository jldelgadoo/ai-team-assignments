---
name: "confidentiality-review"
description: "Revisa que un repositorio use solo datos sintéticos y no filtre información real de ninguna organización. Verifica seed data, busca rastros de datos reales (nombres de empresas, sistemas internos, IPs, credenciales, rutas privadas) y valida que cada caso de uso tenga un nivel de riesgo NIST coherente. Use cuando prepare un proyecto para hacerlo público, antes de un commit que toque datos de ejemplo, o al auditar la confidencialidad de un repo."
license: "MIT"
compatibility: "Works with Kiro (IDE, CLI, Web). Requires read access to the repository."
metadata:
  author: "jldelgadoo"
  version: "1.0.0"
---

# Confidentiality Review

## Overview

Este skill revisa un repositorio para asegurar que **todo el contenido de datos
es sintético** y que no se filtra información real de ninguna organización. Nació
como el agente personalizado `confidentiality-reviewer` del proyecto
*AI Team Assignments* y se empaqueta aquí como Power portable (Agent Plugins
v1.0.0) para reutilizarlo en cualquier proyecto que maneje datos de ejemplo.

Es un revisor de **solo lectura**: analiza y reporta, nunca modifica archivos.

## Prerequisites Checklist

- [ ] El repositorio está disponible localmente (acceso de lectura).
- [ ] Se identifican los archivos de datos de ejemplo (p. ej. `public/seed.json`,
      fixtures, mocks, `*.sample.*`).
- [ ] Se conoce el marco de clasificación de riesgo esperado (por defecto,
      **NIST AI RMF 1.0**: niveles `bajo` | `medio` | `alto`).

## Step-by-Step Guide

### 1. Localizar los datos de ejemplo

Busca los archivos que contienen datos de muestra. Puntos habituales:

```bash
# Semillas y fixtures típicos
find . -type f \( -name "seed*.json" -o -name "*.fixture.*" \
  -o -name "*mock*" -o -name "*sample*" \) -not -path "*/node_modules/*"
```

### 2. Confirmar que los datos son ficticios

Revisa nombres de personas, casos de uso, descripciones y cualquier identificador.
Deben ser genéricos e inventados. Señales de alerta: nombres de personas reales
combinados con cargos reales, nombres de sistemas internos, o proyectos concretos
de una organización identificable.

### 3. Buscar rastros de datos reales

Rastrea patrones que casi nunca deberían aparecer en datos sintéticos:

```bash
# IPs, correos corporativos, claves y rutas privadas (ajusta a tu contexto)
grep -rInE '([0-9]{1,3}\.){3}[0-9]{1,3}' --exclude-dir=node_modules .
grep -rInE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' --exclude-dir=node_modules .
grep -rInE '(AKIA|ASIA)[A-Z0-9]{16}' --exclude-dir=node_modules .   # AWS keys
grep -rInE '(secret|password|api[_-]?key|token)\s*[:=]' --exclude-dir=node_modules .
```

Reporta cualquier coincidencia con archivo y línea. **Nunca** copies el valor
literal de una posible credencial en el informe: refiérete a ella por nombre de
campo y ubicación.

### 4. Validar los niveles de riesgo

Para cada caso de uso, confirma que el nivel de riesgo declarado es uno de los
válidos (`bajo` | `medio` | `alto`) y que es **coherente con su descripción**.
Un caso que procesa datos clínicos sensibles etiquetado como `bajo` es una
inconsistencia que debe reportarse.

### 5. Emitir el veredicto

Entrega un informe corto con uno de dos veredictos:

- **APROBADO** — datos sintéticos, sin rastros de datos reales, riesgos coherentes.
- **CAMBIOS_NECESARIOS** — lista de hallazgos (archivo, línea, motivo).

Formato sugerido del informe: ver [plantilla](references/report-template.md).

## Troubleshooting

### Falsos positivos en la búsqueda de IPs
**Solution:** versiones de librerías (`1.2.3.4`) o rangos de ejemplo pueden
coincidir. Verifica el contexto de cada línea antes de reportarla; no toda
coincidencia es un dato real.

### El proyecto no usa NIST
**Solution:** el nivel de riesgo puede seguir otro marco público (ISO 42001,
EU AI Act). Ajusta el conjunto de niveles válidos del paso 4 al marco declarado
en el steering del proyecto.

### No hay archivo de seed evidente
**Solution:** los datos de ejemplo pueden estar embebidos en código
(`const seed = [...]`) o en tests. Amplía la búsqueda del paso 1 a `src/` y a los
archivos de test antes de concluir que no hay datos de muestra.
