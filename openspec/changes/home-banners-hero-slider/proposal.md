# Proposal

## Why

La página de inicio muestra un hero estático con texto hardcodeado ("Por un mundo mejor"). NATURALVER'S quiere rotar ofertas promocionales desde el panel de Payload (sin deploys de código) y exponer prompts comerciales (envíos, contraentrega) en un carrusel de banners administrable.

## What Changes

- Nuevo **Global** de Payload `HomeBanners` (slug `home-banners`): array `slides` (1–6) con `type`, `title`, `description`, `desktopImage`, `mobileImage`, `buttonLabel`, `buttonLink`, `note`, `showSocialLinks`, `active`; y campos globales `socialLinks` (instagram, facebook, tiktok). Etiquetas en español, `access.read` público.
- Helper de datos **REST** `queryHomeBanners()` en `src/lib/payload.ts` (vía `payloadFetch` a `/api/globals/home-banners?depth=1`), consistente con la capa de datos existente.
- **Hero slider** en el storefront: Server Component que obtiene el Global y filtran los slides `active`, y Client Component con `swiper/react` (Navigation, Pagination, Autoplay, A11y, loop, autoplay 5 s con pausa al hover/focus y al `prefers-reduced-motion`).
- Imágenes **responsive** con `<picture>`/`srcset` (desktop ~1520×400, móvil 1:1) usando el pipeline de `next/image`; primera slide `priority`, resto `lazy`; alt descriptivo con fallback al `title`.
- **Animación** `fadeInUp` en textos, desactivada con `prefers-reduced-motion`.
- **seed**: 3 slides iniciales (Oferta, Envíos, Pago) con el copy proporcionado, escritas directamente a Mongo como el resto del seed.
- Dependencia **swiper** en `package.json` y sus CSS.
- Regenerar tipos de Payload y hook `afterChange` con `revalidatePath('/')` como refuerzo (ver notas).

## Capabilities

### New Capabilities
- `home-banners`: Contenido de banners del hero administrable desde Payload (schema del Global `HomeBanners`, exposición REST, filtrado de slides activos) y su renderizado público en el storefront (carrusel accesible, responsive y optimizado).

### Modified Capabilities
<!-- Sin cambios de requisitos a nivel de spec en capacidades existentes (cms-admin, catalog-data, cart-management, whatsapp-checkout). -->

## Impact

- `payload.config.ts`: registrar el nuevo Global en `globals`.
- Nuevo `src/globals/HomeBanners.ts` (primera Global del repo; hoy solo hay colecciones).
- `src/lib/payload.ts`: añadir `queryHomeBanners()`.
- `src/app/(storefront)/page.tsx`: sustituir el hero estático por `<HeroSlider />`.
- Nuevos `src/components/home/hero-slider.tsx` (Server) y `src/components/home/hero-slider-client.tsx` (Client).
- `src/app/(storefront)/globals.css` o import del componente: CSS de Swiper + keyframes/reduced-motion.
- `package.json`: nueva dependencia `swiper`.
- `scripts/seed.ts` + `scripts/fixtures/`: datos del Global.
- `src/types/payload.ts`: regenerado por `payload generate:types` (tipos `HomeBanners*, HomeBannersSlide, SocialLinks`).

### Notas asumidas / conflictos resueltos
- **Sin localización**: `localized: true` NO se aplica. El spec `cms-admin` exige que cualquier campo localizado tenga un bloque `i18n` completo; el repo es monolingüe y Payload rompería el boot. El sitio sigue en español único.
- **Capa REST** (decisión del usuario): no se usa Local API (`getPayload`) ni GraphQL.
- `revalidatePath` es redundante hoy (`/` es `force-dynamic`): cambios publicados en el panel se ven en la siguiente request. El hook queda como refuerzo si la portada pasa a estática/ISR.
- El seed referencia imágenes ya existentes en `public/media/` (como hace el seed de productos), sin subir binarios propios.