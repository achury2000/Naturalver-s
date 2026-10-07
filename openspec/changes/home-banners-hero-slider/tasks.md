# Tasks

## 1. Global de Payload y tipos

- [x] 1.1 Crear `src/globals/HomeBanners.ts` (GlobalConfig) con `slides` (array `minRows: 1`, `maxRows: 6`), campos `type` (select `offer|shipping|payment|custom`), `title` (required), `description`, `desktopImage`/`mobileImage` (upload → media, required, `filterOptions` imagen), `buttonLabel`, `buttonLink`, `note`, `showSocialLinks`, `active` (checkbox, default true), y `socialLinks` global (`instagram`, `facebook`, `tiktok`); labels en español, `admin.group: 'Portada'`, `access.read: () => true` y hook `afterChange` con `revalidatePath('/', 'layout')`. Verificar: el archivo compila con `npm run typecheck`.
- [x] 1.2 Registrar `HomeBanners` en `payload.config.ts` dentro del array `globals` (ya existente y vacío; nunca llamar `buildConfig()` de nuevo). Verificar: `globals: [HomeBanners]` presente en la config y solo una instancia de config.
- [x] 1.3 `npx payload generate:types` y confirmar que `src/types/payload.ts` incluye los tipos del Global (`HomeBanners`, `HomeBannersSlide`, social links). Verificar: `git diff` de `src/types/payload.ts` añade esos tipos y `npm run typecheck` no rompe.
- [x] 1.4 Boot de dev: `npm run dev` arranca sin errores de config de Global y `/admin` muestra la sección "Banners de inicio" (grupo Portada). Verificar: sin errores en consola y la sección visible en el panel.

## 2. Capa de datos REST

- [x] 2.1 Añadir `queryHomeBanners()` en `src/lib/payload.ts` con `payloadFetch<HomeBanner>('/globals/home-banners?depth=1')` y `try/catch → null` (patrón `queryPageBySlug`). Verificar: `npm run typecheck` sin errores.
- [x] 2.2 En dev, `GET /api/globals/home-banners?depth=1` responde 200 con el objeto Global (puede estar vacío aún, sin lanzar error). Verificar: respuesta 200 en el navegador antes del seed.

## 3. Componentes del carrusel

- [x] 3.1 `npm i swiper` y confirmar que entra en `package.json` sin conflictos de peer con React 19. Verificar: `npm ls swiper` lo reporta instalado.
- [x] 3.2 Crear `src/components/home/hero-slider.tsx` (Server Component): llama `queryHomeBanners()`, filtra `active === true` conservando el orden del admin, mapea a props planas serializables (`getImageUrl` sobre media, `alt` fallback al `title`) y devuelve `null` si no hay slides activos o el Global es `null`. Verificar: con API caída o sin slides activos la home renderiza sin error (carrusel ausente).
- [x] 3.3 Crear `src/components/home/hero-slider-client.tsx` (`'use client'`) con Swiper: módulos `Navigation`, `Pagination`, `Autoplay`, `A11y`; `loop`, `autoplay { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }`, paginación clickable, flechas con `aria-label` en español y autoplay desactivado cuando `matchMedia('(prefers-reduced-motion: reduce)')` coincide (guard en efecto). Importar los CSS de swiper dentro del componente. Verificar en dev: rotación automática, pausa al hover y sin autoplay con reduced-motion (DevTools).
- [x] 3.4 Imágenes en `<picture>` con `getImageProps` de `next/image`: `<source media="(min-width:1024px)">` desktop (~1520×400) y fuente móvil (1:1); primera slide `priority`, resto `lazy`/`decoding="async"`; `aspect-ratio` con `object-cover`; `alt` descriptivo con fallback al título. Verificar en dev: la imagen cambia por breakpoint y el primer slide carga eager.
- [x] 3.5 Añadir en `globals.css` el keyframe `fadeInUp` (textos con delay escalonado) y un bloque `@media (prefers-reduced-motion: reduce)` que desactive animaciones y el `scroll-behavior`; overlay de lectura (`from-black/50`) para contraste AA de textos sobre la imagen. Verificar: DevTools redude-motion desactiva animaciones; contraste AA en Inspector para texto del slide.
- [x] 3.6 Verificación de grupo en `npm run dev`: teclado (Tab + Enter sobre flechas/bullets cambia de slide), flujo móvil (imagen móvil), foco visible en controles y sin errores de hidratación en consola.

## 4. Integración en la home

- [x] 4.1 Reemplazar el hero estático de `src/app/(storefront)/page.tsx` por `<HeroSlider />`, dejando intactas FeaturedProducts y el resto de secciones. Verificar: la home renderiza el carrusel en / y conserva el resto.
- [x] 4.2 Verificar en dev que `/` no pierde el estado de hidratación (sin warnings) y el carrusel convive con el header `fixed` (offset `pt-16` ya existente en `site-layout.tsx`).

## 5. Seed

- [x] 5.1 Exportar `mockHomeBanners` en `scripts/fixtures/` con 3 slides — Oferta ("¡Lleva un regalo con tu compra!" + botón "Ver cremas"), Envíos, Pago contraentrega — y `socialLinks`; reutilizar archivos de `public/media/` para `desktopImage`/`mobileImage`. Verificar: el fixture tipa correctamente con `npm run typecheck`.
- [x] 5.2 En `scripts/seed.ts`, borrar `db.collection('globals').deleteMany({ slug: 'home-banners' })` e insertar el doc del Global usando ObjectIds de media ya insertados (`imageMap`) para las imágenes. Verificar: `npm run seed` termina sin errores y reporta la escritura del Global. **Nota:** el filtro real es `deleteMany({ globalType: 'home-banners' })` — Payload 3.26/Mongo guarda globals en la colección `globals` con el campo `globalType` (discriminatorKey de mongoose), no `slug`.
- [x] 5.3 Resolver el Open Question de forma del doc: tras `npm run seed`, `GET /api/globals/home-banners?depth=1` devuelve los 3 slides con imágenes resueltas y `/admin` muestra "Banners de inicio" con contenido; si la forma no es la esperada, ajustar el doc del fixture a lo que Payload 3.26 almacena. Verificar: respuesta REST con slides y panel admin poblado. **Resultado:** la forma `{ globalType: 'home-banners', slides: [...], socialLinks, createdAt, updatedAt }` funciona; REST devuelve 3 slides con media resuelto (`/api/media/file/<slug>.jpg`).

## 6. Verificación de integración

- [x] 6.1 `npm run typecheck` sin errores (0).
- [x] 6.2 `npm run build` sin errores; la home sigue `force-dynamic` (ƒ) y no se realizan llamadas al CMS en build. Verificar: build OK con la API apagada.
- [x] 6.3 Verificación final en dev y (opcional) redeploy docker: home muestra el carrusel con los 3 slides, la edición en `/admin` se refleja al recargar `/`, y no hay console.log ni código comentado residual. Verificar: navegación en localhost:3000 (o contenedor) sin errores.