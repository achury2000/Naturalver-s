#!/bin/sh
# ============================================================================
# NATURALVER'S — Despliegue de producción (POSIX sh, sin dependencias de bash)
#
#   ./deploy-prod.sh              -> despliega (sin seed)
#   ./deploy-prod.sh --seed       -> despliega y ejecuta el seed idempotente
#   ./deploy-prod.sh --clean      -> DESTRUCTIVO: borra contenedores, volúmenes
#                                    (incluida la base de datos) e imágenes
#                                    locales, y luego despliega desde cero
#   ./deploy-prod.sh --no-seed    -> explícitamente sin seed (valor por defecto)
#
# Requisitos: Docker Engine + Docker Compose V2.
#
# Orden de ejecución (a propósito):
#   config -> mongo -> build app -> app -> seed -> ps
# MongoDB se levanta ANTES de construir la app porque el build sólo necesita
# el código, pero `up -d --wait app` exige que mongo esté healthy, y montar
# la app sobre una base que aún no responde sólo produce reinicios.
# ============================================================================
set -eu

# ----------------------------- Localización --------------------------------
# El script trabaja siempre desde su propio directorio, así da igual desde
# dónde se invoque.
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"
COMPOSE_FILE="compose.prod.yaml"

# ------------------------------- Salida ------------------------------------
RED=""
VERDE=""
AMARILLO=""
ROJO=""
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  RED='\033[0;31m'
  VERDE='\033[0;32m'
  AMARILLO='\033[0;33m'
  ROJO='\033[0;31m'
  RESET='\033[0m'
else
  RESET=""
fi

info()  { printf '%s==>%s %s\n' "$VERDE" "$RESET" "$*"; }
aviso() { printf '%sAviso:%s %s\n' "$AMARILLO" "$RESET" "$*" >&2; }
error() { printf '%sERROR:%s %s\n' "$ROJO" "$RESET" "$*" >&2; }

die() {
  error "$*"
  exit 1
}

# ------------------------------ Parseo de flags ----------------------------
DO_CLEAN="no"
DO_SEED="no"

for arg in "$@"; do
  case "$arg" in
    --clean)   DO_CLEAN="si" ;;
    --seed)    DO_SEED="si" ;;
    --no-seed) DO_SEED="no" ;;
    -h|--help)
      cat <<'EOF'
NATURALVER'S — despliegue de producción

Uso:
  ./deploy-prod.sh [OPCIONES]

Opciones:
  --clean     DESTRUCTIVO. Borra contenedores, volúmenes (incluida la base de
              datos) e imágenes locales del proyecto, y despliega desde cero.
  --seed      Ejecuta el seed idempotente al terminar.
  --no-seed   No ejecuta el seed. Es el valor por defecto.
  -h, --help  Muestra esta ayuda.

Variables requeridas (ver .env.example):
  PAYLOAD_SECRET              secreto de Payload, obligatorio
  MONGO_DB_NAME               nombre de la base de datos
  APP_PORT                    puerto en el host
  NEXT_PUBLIC_SITE_URL        URL pública y absoluta del sitio
  NEXT_PUBLIC_WHATSAPP_NUMBER dígitos, código de país, sin +
EOF
      exit 0
      ;;
    *)
      die "Opción desconocida: '$arg'. Usa --help para ver las opciones válidas."
      ;;
  esac
done

# ------------------- 0. Requisitos: Docker + Compose V2 -------------------
command -v docker >/dev/null 2>&1 \
  || die "No se encontró 'docker' en el PATH.
Instala Docker Desktop (macOS/Windows) o Docker Engine (Linux) y vuelve a intentarlo."

if ! docker compose version >/dev/null 2>&1; then
  die "Docker Compose V2 no está disponible.
Este script usa el subcomando 'docker compose' (V2). Se detectó una versión
antigua o ausente. Actualiza Docker y NO intentes usar 'docker-compose' (V1):
Compose V1 no soporta 'up --wait' ni 'depends_on: condition: service_healthy'."
fi

COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "desconocida")
info "Docker Compose V2 detectado (versión $COMPOSE_VERSION)"

[ -f "$COMPOSE_FILE" ] || die "No se encontró $COMPOSE_FILE en $SCRIPT_DIR"

# ------------------------------ 1. Archivo .env ----------------------------
# Va ANTES que --clean a propósito: `docker compose --env-file .env` falla si
# el archivo no existe, así que en un clon recién habría que crearlo primero.
if [ ! -f "$ENV_FILE" ]; then
  [ -f "$ENV_EXAMPLE" ] || die "No existe $ENV_FILE ni $ENV_EXAMPLE. No hay de dónde copiar la configuración."
  info "No se encontró $ENV_FILE; se crea una copia desde $ENV_EXAMPLE."
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  aviso "Se creó $ENV_FILE. EDÍTALO y rellena PAYLOAD_SECRET antes de continuar."
fi

# El script se llama a sí mismo por el nombre de compose que declara
# `env_file`, así que todo el compose va precedido del --env-file.
DC="docker compose --env-file $ENV_FILE -f $COMPOSE_FILE"

# ------------------------------ 2. Modo --clean ---------------------------
# Sólo para avisar: --clean es explícito y destructivo por diseño.
if [ "$DO_CLEAN" = "si" ]; then
  aviso "MODO DESTRUCTIVO (--clean): se borrarán contenedores, volúmenes (incluida"
  aviso "la base de datos MongoDB) e imágenes locales del proyecto. Los datos"
  aviso "NO se pueden recuperar."
fi

if [ "$DO_CLEAN" = "si" ]; then
  info "Limpiando contenedores, volúmenes e imágenes locales del proyecto..."
  # -v borra el volumen de Mongo (la base de datos) y el de media.
  # --rmi local borra sólo las imágenes construidas aquí, no la de mongo:7.
  # --remove-orphans se lleva contenedores de despliegues anteriores que
  # ya no estén en el compose.
  $DC down -v --remove-orphans --rmi local
  info "Limpieza completada."
fi

# ------------------------- 3. Validación de secretos ----------------------
# get_env <NOMBRE>: imprime el valor de la variable dentro de $ENV_FILE,
# ignorando espacios alrededor del '=' y los comentarios.
get_env() {
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*\(.*\)$/\1/p" "$ENV_FILE" | head -n 1 | sed 's/[[:space:]]*$//'
}

REQUIRED_SECRET="PAYLOAD_SECRET"
REQUIRED_VALUES="MONGO_DB_NAME APP_PORT NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_WHATSAPP_NUMBER"

INVALID=""

# Secretos: no pueden estar vacíos ni conservar el placeholder YOUR_.
valor=$(get_env "$REQUIRED_SECRET")
if [ -z "$valor" ]; then
  INVALID="$INVALID
  $REQUIRED_SECRET está vacío. Genera uno con: openssl rand -base64 48"
elif [ "${valor#YOUR_}" != "$valor" ]; then
  INVALID="$INVALID
  $REQUIRED_SECRET conserva el placeholder ($valor). Genera uno con: openssl rand -base64 48"
fi

# Valores sin secreto: basta con que estén presentes y no sean placeholders.
for var in $REQUIRED_VALUES; do
  valor=$(get_env "$var")
  if [ -z "$valor" ]; then
    INVALID="$INVALID
  $var está vacío (ver $ENV_EXAMPLE)"
  elif [ "${valor#YOUR_}" != "$valor" ]; then
    INVALID="$INVALID
  $var conserva el placeholder ($valor)"
  fi
done

if [ -n "$INVALID" ]; then
  error "Faltan variables obligatorias en $ENV_FILE:$INVALID"
  die "Corrige $ENV_FILE y vuelve a ejecutar el script. No se ha desplegado nada."
fi

info "Variables obligatorias presentes en $ENV_FILE"

# La URL debe ser absoluta: Payload la usa como serverURL y next.config.js la
# descompone con `new URL()` en tiempo de build. Un valor relativo rompe el
# build con un error poco descriptivo.
SITE_URL=$(get_env NEXT_PUBLIC_SITE_URL)
case "$SITE_URL" in
  http://*|https://*) ;;
  *)
    die "NEXT_PUBLIC_SITE_URL debe ser una URL absoluta (http:// o https://). Valor actual: '$SITE_URL'"
    ;;
esac

# El número de WhatsApp se compila dentro del bundle del cliente y se limpia
# dejando sólo dígitos. Si tiene letras, el enlace wa.me queda mal formado.
WA_NUMBER=$(get_env NEXT_PUBLIC_WHATSAPP_NUMBER)
WA_DIGITS=$(printf '%s' "$WA_NUMBER" | tr -cd '0-9')
if [ "$WA_DIGITS" != "$WA_NUMBER" ]; then
  die "NEXT_PUBLIC_WHATSAPP_NUMBER debe contener SÓLO dígitos (código de país incluido, sin +). Valor actual: '$WA_NUMBER'"
fi

APP_PORT_VALUE=$(get_env APP_PORT)
case "$APP_PORT_VALUE" in
  ''|*[!0-9]*) die "APP_PORT debe ser un número entero. Valor actual: '$APP_PORT_VALUE'" ;;
esac

DB_NAME=$(get_env MONGO_DB_NAME)
info "Configuración: puerto $APP_PORT_VALUE, base de datos '$DB_NAME', sitio $SITE_URL"

# --------------------------- 6. Despliegue por fases -----------------------
# Fase 1: validar el compose. Detecta variables mal formadas y claves
# desconocidas antes de tocar nada.
info "Validando la configuración de Compose..."
$DC config --quiet
info "Configuración válida."

# Fase 2: MongoDB primero. --wait bloquea hasta que el healthcheck pase, así
# que cuando este comando vuelve, mongo responde ping de verdad.
info "Levantando MongoDB y esperando a que esté sano..."
$DC up -d --wait mongo
info "MongoDB está sano."

# Fase 3: construir la imagen de la app. Va después de mongo a propósito: si
# el build falla (p. ej. un typecheck roto) no se ha perdido ningún dato.
info "Construyendo la imagen de la aplicación (esto puede tardar)..."
$DC build app
info "Imagen construida."

# Fase 4: levantar la app. depends_on (condition: service_healthy) sobre
# mongo, y --wait espera a que su propio healthcheck /api/health devuelva 200,
# lo que sólo ocurre cuando la app ya alcanza MongoDB.
info "Levantando la aplicación y esperando a que esté sana..."
$DC up -d --wait app
info "La aplicación está sana."

# Fase 5: seed, sólo si se pidió.
if [ "$DO_SEED" = "si" ]; then
  info "Ejecutando el seed idempotente..."
  $DC exec -T app node scripts/seed-idempotent.mjs
  info "Seed idempotente completado."
fi

# ---------------------------- 7. Estado final ------------------------------
info "Estado de los servicios:"
$DC ps

HEALTH_URL="http://localhost:$APP_PORT_VALUE/api/health"

info "Despliegue completado."
echo ""
echo "  Sitio web:  http://localhost:$APP_PORT_VALUE"
echo "  Panel admin: http://localhost:$APP_PORT_VALUE/admin"
echo "  Healthcheck: $HEALTH_URL"
echo ""

if [ "$DO_SEED" != "si" ]; then
  aviso "No se ejecutó el seed (valor por defecto). Para poblar el catálogo:"
  echo "    ./deploy-prod.sh --seed"
  echo "  o directamente:  ./scripts/docker-seed.sh"
  echo ""
fi

info "Si NEXT_PUBLIC_SITE_URL no es la URL pública real, corrígela en .env y"
info "reconstruye: los NEXT_PUBLIC_* se compilan dentro del bundle del cliente."
