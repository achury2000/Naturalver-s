# Design

## Context

Ver `proposal.md — Why` para la motivación. Estado actual que condiciona el diseño:

- `src/lib/payload.ts` es la única capa de datos del storefront; todos los helpers usan `payloadFetch` (REST). `/` es `force-dynamic` desde el cambio `home-page-prioritize-products`, así que consultar el CMS no rompe `npm run build`.
- El repo no tiene `src/globals/` aún (solo colecciones). `globals` se sirve en `/api/globals/<slug>?depth=<n>`.
- `cms-admin` exige **sin campos `localized` sin bloque `i18n`**: no localizar. El sitio es monolingüe (español).
- Diseño disponible: tokens `--color-brand-dark #036654`, `--color-brand-light #69AB4F`, `--color-brand-navy #273B52`, `--color-brand-sky #0CA6DF`; tipografías Lora (encabezados), Raleway (cuerpo), Great Vibes (script). En `globals.css` ya existen keyframes `fadeIn`, `slideUp`, `float`, `pulse-slow` y **no** hay bloque `prefers-reduced-motion`.
- El seed escribe directo a Mongo (driver), sin hooks ni validación de Payload.

## Goals / Non-Goals

**Goals:**
- Primera Global de Payload del repo (`HomeBanners`), editable en `/admin` con etiquetas en español y `read` público.
- Leer el Global por **REST** (`payloadFetch`) y renderizar solo slides activos.
- Carrusel accesible (teclado, flechas, puntos, labels), autoplay 5 s con pausa al hover/focus y desactivado con `prefers-reduced-motion`.
- Imágenes responsive (desktop ~1520×400 / móvil 1:1) vía pipeline `next/image` (`<picture>` + srcset), primera slide `priority`.
- Seed de 3 slides (Oferta, Envíos, Pago) insertando el doc Global directamente en `db.collection('globals')`.

**Non-Goals:**
- No usar Local API (`getPayload`) ni GraphQL.
- No localizar campos (`localized: true` queda fuera; ver `cms-admin`).
- No crear imágenes binarias nuevas en el seed: se reutilizan los archivos ya versionados en `public/media/` y los media docs del seed de productos.
- No tocar el resto del hero y secciones de la home más allá del reemplazo del hero estático.
- No informes/analytics de impresiones del carrusel.

## Decisions

**1. Global `HomeBanners` como primer Global del repo.**
`src/globals/HomeBanners.ts` (`GlobalConfig`), registrado en `payload.config.ts` dentro de `globals: [HomeBanners]` (el array existe y está vacío). Admin `group: 'Portada'`.
- `slides`: array con `minRows: 1`, `maxRows: 6` (validación nativa → cubre el requisito de límite). Cada slide:
  - `type`: select of `offer|shipping|payment|custom` etiquetado ("Oferta", "Envíos", "Pago contraentrega", "Personalizado").
  - `title`: text, `required`.
  - `description`: textarea.
  - `desktopImage` / `mobileImage`: `type: 'upload', relationTo: 'media', required: true`, con `filterOptions` para `mimeType` imagen.
  - `buttonLabel` / `buttonLink`: text (opcionales).
  - `note`: textarea (opcional, p. ej. términos legales).
  - `showSocialLinks`: checkbox (default false).
  - `active`: checkbox (default true).
- `socialLinks`: group global con `instagram`, `facebook`, `tiktok` (text, opcionales).
- `access: { read: () => true }`; las mutaciones quedan restringidas por el login admin de Payload (por defecto).
- `afterChange` hook importando `revalidatePath` de `next/cache` y llamando `revalidatePath('/', 'layout')`. Es refuerzo: `/` ya es `force-dynamic`, así que un cambio en el panel se ve en la próxima request. Alternativa considerada: omitirlo; se mantiene por ser lo pedido y por si la portada pasa a estática/ISR.

**2. Data layer REST.**
`queryHomeBanners()` en `src/lib/payload.ts`, patrón de `queryPageBySlug` (try/catch → `null`), llamando `payloadFetch<HomeBanners>('/globals/home-banners?depth=1')`. `depth=1` resuelve `desktopImage`/`mobileImage` a los docs de media (`url`, `alt`, `width`, `height`) para que el Server Component pueda serializar props planas. Alternativas descartadas: `getPayload` (el usuario eligió REST) y GraphQL (no servido).

**3. Split Server/Client.**
- `src/components/home/hero-slider.tsx` (Server): `queryHomeBanners()`, filtra `active === true`, conserva el orden del admin, mapea a props serializables (solo strings/booleans/objetos planos; `getImageUrl` sobre media, `alt` con fallback al `title`). Si no hay slides activos o el Global es `null` (API caída), renderiza `null` sin romper la home.
- `src/components/home/hero-slider-client.tsx` (`'use client'`): Swiper. Filtrado de slides en el server, no en el cliente (menos JS y una sola fuente de verdad).

**4. Swiper.**
`npm i swiper` (React 19 compatible). Módulos: `Navigation`, `Pagination`, `Autoplay`, `A11y`. Config: `loop`, `autoplay: { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }`, `pagination: { clickable: true }`, flechas con `aria-label` en español ("Slide anterior"/"Slide siguiente") y bullets con labels accesibles. Autoplay desactivado en runtime cuando `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (guard en `useEffect`). El CSS de swiper se importa dentro del componente cliente (`import 'swiper/css'` + navigation/pagination) para no contaminar `globals.css`. Alternativa descartada: carrusel a mano (más código de a11y/simplifique dar vuelta) y embla/carousel aria (Swiper ya cubre Navigation/A11y y es lo que se pidió).

**5. Imágenes responsive con `<picture>` + `next/image`.**
Se usa `getImageProps` de `next/image` (`import { getImageProps } from 'next/image'`) para generar dos `srcSet` optimizados (`/_next/image?url=...&w=...`): desktop (`<source media="(min-width: 1024px)">`) y móvil (fuente por defecto + `<img>` de fallback). Primera slide: `priority` (fetchPriority high, eager); resto: `lazy` + `decoding="async"`. `alt = image.alt || title`. Contenedor con `aspect-ratio` (~1520/400 en md+, 1/1 base) y `object-cover`. Alternativa: dos `<Image>` con `hidden md:block` (simplifica pero no es `<picture>` y duplica markup); se descartó porque el requisito pide `<picture>`.

**6. Animación fadeInUp y reduced-motion.**
Añadir en `globals.css` un keyframe `fadeInUp` (equivalente al `slideUp` existente: `translateY(20px)→0` + opacity) aplicado a los textos de cada slide (delay escalonado 0/150/300 ms). Nuevo bloque `@media (prefers-reduced-motion: reduce)` que desactiva `animation` y `scroll-behavior`. Overlay de lectura: gradiente `bg-gradient-to-t from-black/50` bajo el texto blanco (contraste AA). Botones con `bg-brand-dark`/`bg-brand-light` y texto en Lora/Raleway según tokens existentes.

**7. Seed directo a Mongo.**
En `scripts/fixtures/` (extender `catalog.ts` o un `home-banners.ts`), exportar `mockHomeBanners` con los 3 slides (Oferta: "¡Lleva un regalo con tu compra!" + "Ver cremas", Envíos, Pago contraentrega) y `socialLinks`. En `seed.ts`:
1. `await db.collection('globals').deleteMany({ slug: 'home-banners' })`.
2. Construir el doc con `desktopImage`/`mobileImage` = ObjectIds de los media docs ya insertados (`imageMap`) para reutilizar filas/archivos existentes; `createdAt`/`updatedAt`.
3. `insertOne` en `db.collection('globals')`.
Riesgo: Payload 3 guarda globals en la colección `globals` con una forma específica (ver Open Questions). Mitigación: al aplicar, verificar `GET /api/globals/home-banners?depth=1` y el panel tras `npm run seed`.

**8. Tipos.**
`npx payload generate:types` regenera `src/types/payload.ts` incluyendo `HomeBanners`, `HomeBannersSlide`, `HomeBannersSocialLinks`. No hay componentes admin custom → `importMap.js` sigue `{}`; no hace falta `generate:importmap`.

## Risks / Trade-offs

- [Forma exacta del doc de Global en Mongo para el seed] → verificar durante la implementación leyendo el payload del `globals` (o probando la REST tras el seed); ajustar el doc del fixture. No cambia specs ni approach.
- [CSS de Swiper chocando con estilos globales] → importar scoped en el componente cliente; no tocar `globals.css` con `@import` de swiper.
- [React 19 / Next 15 vs Swiper] → usar la última v11 del wrapper `swiper/react`; verificación con `npm run typecheck` + `npm run dev`.
- [Autoplay molesto o con saltos en `loop`] → `pauseOnMouseEnter` + pausa en focus + desactivado con reduced-motion; `loop` estándar.
- [Imágenes sin alt (Media.alt es opcional)] → fallback al `title` en el render y requisito documentado en el spec.
- [Reemplazo del hero elimina copy comercial existente] → el carrusel lo sustituye por contenido editable del CMS; la marca queda en secciones contiguas (FeaturedProducts, etc.).

## Migration Plan

1. `npm i swiper`.
2. Crear `src/globals/HomeBanners.ts`, registrar en `payload.config.ts`, `npx payload generate:types`.
3. Añadir `queryHomeBanners()` en `src/lib/payload.ts`.
4. Componentes server/client y reemplazo del hero en `page.tsx`; CSS (keyframe + reduced-motion).
5. Extender fixtures y `seed.ts`; `npm run seed`.
6. Verificar: `npm run typecheck`, `npm run dev` (home muestra 3 slides, admin los edita), `npm run build`; opcional redeploy docker (`naturalvers-app-1`) para prod.
Rollback: revertir `page.tsx` al hero estático y quitar `HomeBanners` de `globals`; el Global es aditivo y no afecta otras rutas.

## Open Questions

- Forma exacta que Payload 3.26 espera en la colección `globals` para el seed por driver (campo `globalType`/`value` vs campos planos). Se resuelve durante la implementación con un `GET /api/globals/home-banners` tras seed; no altera specs ni breakdown.
- Elección cosmética de qué archivo de `public/media/` reutiliza cada slide del seed.