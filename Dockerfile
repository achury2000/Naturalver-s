# syntax=docker/dockerfile:1

###############################################################################
# NATURALVER'S — Imagen de producción
#
# Stage 1  deps      -> caché de dependencias (incluye devDeps, necesario para
#                       compilar Tailwind/PostCSS/TypeScript)
# Stage 2  builder   -> `next build` con output:'standalone'
# Stage 3  runner    -> sólo el bundle trazado + estáticos. Usuario no-root.
#
# Nota sobre sharp (Payload lo necesita para Media.imageSizes):
#   `npm ci` y `next build` corren DENTRO de la imagen Linux, así que el
#   trazado de standalone ya incluye el binario @img/sharp-linux-x64.
#   La stage runner copia además /app/node_modules/sharp explícitamente como
#   red de seguridad, porque sharp es una dependencia nativa y un trazado
#   incorrecto sólo se manifiesta en runtime (admin de Payload / /api/media).
###############################################################################

# ----------------------------- Stage 1: deps --------------------------------
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Solo los manifiestos: esta capa se cachea mientras el lockfile no cambie.
COPY package.json package-lock.json ./

# `npm ci` es reproducible y falla si el lockfile no cuadra con package.json.
# --no-audit --no-fund acelera; --ignore-scripts NO se usa porque Payload
# necesita sus postinstall.
RUN npm ci --no-audit --no-fund

# ---------------------------- Stage 2: builder ------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables NEXT_PUBLIC_* se INLINEN en el bundle del cliente durante el
# build. checkout-form.tsx es un Client Component que llama a
# getWhatsappNumber() -> process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, así que el
# valor debe existir AHORA, no sólo en runtime. Si se olvida, el checkout
# queda con el número "vacío" compilado dentro del JS del navegador.
# defaults idénticos a los de .env.example para que el build nunca falle por
# una variable ausente; compose.prod.yaml los sobreescribe en build.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_PAYLOAD_API_URL=/api
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_PAYLOAD_API_URL=$NEXT_PUBLIC_PAYLOAD_API_URL
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER

# PAYLOAD_SECRET se valida al arrancar; un valor de build no filtra al
# cliente porque no lleva el prefijo NEXT_PUBLIC_. Payload exige que el
# secreto no contenga "dev-secret" en producción, así que se pasa uno real.
ARG PAYLOAD_SECRET=build-time-placeholder-secret
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

RUN npm run build

# media/ está versionado en git, pero git no puede trackear un directorio
# vacío. Si alguien clona sin los jpgs, `COPY ... /app/media` fallaría más
# abajo, así que se garantiza que el directorio existe en el builder.
RUN mkdir -p /app/media

# ---------------------------- Stage 3: runner -------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Runner no-root: node:22-bookworm-slim ya incluye el usuario `node`
# (uid 1000). Se reutiliza en lugar de crear otro para evitar una capa extra.
# `curl` NO se instala a propósito: el healthcheck usa `node -e fetch(...)`,
# que ya está disponible y no añade bytes a la imagen.

# El bundle standalone: server.js + node_modules trazados (payload, mongodb,
# @payloadcms/*, sharp...).
COPY --from=builder --chown=node:node /app/.next/standalone ./

# Estáticos de Next y assets públicos: DEBEN vivir junto a server.js.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Verificación de sharp (dependencia nativa usada por payload.config.ts).
# NO se copia a mano: el standalone ya colorea /app/node_modules con los deps
# trazados, así que el builder y el runner comparten esa misma ruta y un
# "cp de seguridad" sería copiar el directorio sobre sí mismo.
# En vez de parchear a ciegas, se EXIGE que funcione: si una actualización de
# Next/Payload rompe el trazado, el build falla aquí con un mensaje claro en
# lugar de descubrirlo en producción cuando Payload no puede procesar media.
# `require('sharp')` además valida que el binario @img/sharp-linux-x64 esté
# presente y sea loadable (no sólo que el directorio exista).
RUN node -e "require('sharp'); console.log('sharp OK ->', require('sharp').versions.vips)" \
 || (echo "ERROR: sharp no fue trazado por standalone. Payload fallará en /api/media y en el admin." && exit 1)

# Datos versionados de media: Payload resuelve las subidas como media/<archivo>.
# Tiene que existir y ser escribible por el usuario no-root, o el admin de
# Payload falla al subir y las filas sembradas dan 500.
COPY --from=builder --chown=node:node /app/media/ /app/media/
RUN chown -R node:node /app/media

# Seed idempotente. Vive DENTRO de standalone a propósito: el runtime no
# tiene TypeScript ni tsx, y desde aquí `mongodb` resuelve contra
# /app/node_modules/mongodb (ya trazado). Un .mjs corre con node pelado.
COPY --from=builder --chown=node:node /app/scripts/seed-idempotent.mjs ./scripts/seed-idempotent.mjs
COPY --from=builder --chown=node:node /app/scripts/fixtures ./scripts/fixtures

USER node

EXPOSE 3000
STOPSIGNAL SIGTERM

# server.js lee PORT y HOSTNAME del entorno.
CMD ["node", "server.js"]
