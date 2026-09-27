#!/usr/bin/env bash
#
# scan.sh — Barrido rápido de rastros de datos reales para el Power
# confidentiality-guard. Solo lectura: imprime coincidencias, no modifica nada.
#
# Uso:
#   ./scan.sh [directorio]   (por defecto: el directorio actual)
#
# Salida: coincidencias con archivo:línea por cada patrón sensible. Revisa el
# contexto de cada línea; no toda coincidencia es un dato real (falsos positivos
# como versiones de librerías o rangos de ejemplo).

set -euo pipefail

ROOT="${1:-.}"
EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist)

echo "== Confidentiality scan en: $ROOT =="

echo
echo "-- Posibles direcciones IP --"
grep -rInE '([0-9]{1,3}\.){3}[0-9]{1,3}' "${EXCLUDES[@]}" "$ROOT" || echo "  (sin coincidencias)"

echo
echo "-- Posibles correos electrónicos --"
grep -rInE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "${EXCLUDES[@]}" "$ROOT" || echo "  (sin coincidencias)"

echo
echo "-- Posibles claves de acceso AWS --"
grep -rInE '(AKIA|ASIA)[A-Z0-9]{16}' "${EXCLUDES[@]}" "$ROOT" || echo "  (sin coincidencias)"

echo
echo "-- Posibles secretos / credenciales --"
grep -rInE '(secret|password|api[_-]?key|token)[[:space:]]*[:=]' "${EXCLUDES[@]}" "$ROOT" || echo "  (sin coincidencias)"

echo
echo "Revisa el contexto de cada línea antes de reportarla. No transcribas"
echo "valores literales de posibles credenciales en el informe."
