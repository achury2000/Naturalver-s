#!/bin/sh
# ============================================================================
# NATURALVER'S — Ejecuta el seed IDEMPOTENTE dentro del contenedor de la app
#
# No borra nada: hace upsert por slug sobre categorías, media y productos.
# Es seguro reejecutarlo; de hecho está pensado para eso.
#
# Uso:  ./scripts/docker-seed.sh
#
# Equivalente a lo que hace deploy-prod.sh con el flag --seed, pero aislado
# para poder lanzarlo por separado sin reconstruir la imagen.
# ============================================================================
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_DIR"

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      echo "Uso: $0"
      echo "  Ejecuta scripts/seed-idempotent.mjs dentro del contenedor 'app'."
      exit 0
      ;;
    *)
      echo "ERROR: opción desconocida '$arg'." >&2
      echo "Uso: $0 (sin argumentos)" >&2
      exit 1
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'docker' en el PATH." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: se requiere Docker Compose V2 (el subcomando 'docker compose')." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "ERROR: falta .env. Ejecuta primero ./deploy-prod.sh para generarlo desde .env.example." >&2
  exit 1
fi

echo ">> Ejecutando seed idempotente (upsert por clave natural, no borra nada)"
echo ">> Esto NO borra datos. Para sembrar desde cero usa: ./deploy-prod.sh --clean --seed"

# `exec -T` desactiva la TTY: imprescindible si el script corre desde un
# pipeline o desde CI, donde no hay terminal que abandonar.
# `exec` sustituye el proceso para que el código de salida del seed sea
# directamente el del script.
exec docker compose --env-file .env -f compose.prod.yaml \
  exec -T app node scripts/seed-idempotent.mjs
