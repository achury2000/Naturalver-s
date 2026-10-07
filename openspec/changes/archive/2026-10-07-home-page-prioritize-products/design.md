# Design

## Context

Current home page (`src/app/(storefront)/page.tsx`) has:
- Hero section with "Por un mundo mejor" branding
- Hardcoded category grid (now dynamic from CMS via previous change)
- "Por qué elegirnos" section with 3 static cards

The page uses `Section` and `Container` layout components, `ProductCard` for product display, and fetches data via `src/lib/payload.ts` utilities. The page is a Server Component with `force-dynamic` rendering via the storefront layout.

## Goals / Non-Goals

**Goals:**
- Add a featured products section between hero and categories
- Fetch 8 featured/newest products from Payload CMS
- Display in responsive grid (1 col mobile, 2 tablet, 4 desktop)
- Reuse existing `ProductCard` component for consistency
- Section appears between hero and categories

**Non-Goals:**
- Adding a "featured" boolean field to products in CMS (use createdAt/newest as default)
- Admin UI for manual product featuring (future enhancement)
- Carousel/slider UI (static grid only)
- Changing product detail pages or catalog page

## Decisions

### 1. Data Fetching: Extend `queryProducts` vs new function

**Decision:** Add a new `queryFeaturedProducts` function in `src/lib/payload.ts` that wraps `queryProducts` with sensible defaults (sort by `-createdAt`, limit 8, depth 2 for images).

**Rationale:** Keeps concerns separated; home page has specific needs (newest, limit 8) different from catalog page (pagination, filters, sorting). Easier to test and modify independently.

**Alternative considered:** Extend `queryProducts` with optional `featured` parameter. Rejected because it mixes catalog pagination logic with home page featured logic.

### 2. Featured Selection Criteria

**Decision:** Default to newest products (sort by `-createdAt`, limit 8). No "featured" boolean field in CMS yet.

**Rationale:** Zero CMS schema changes required. Works immediately with existing data. Can be enhanced later with a featured flag.

**Alternative considered:** Add a `featured` boolean field to Products collection. Rejected for now - requires CMS migration and admin UI.

### 3. Component Structure

**Decision:** Create a new `FeaturedProducts` Server Component in `src/components/home/featured-products.tsx` that fetches data and renders the grid using existing `ProductCard`.

**Rationale:** 
- Separation of concerns: data fetching separate from page layout
- Reusable if needed elsewhere
- Server Component by default (no client-side JS needed)
- Follows existing pattern: `ProductGrid` + `ProductCard`

**Alternative considered:** Inline the fetch and grid in `page.tsx`. Rejected - less reusable, harder to test.

### 4. Grid Layout

**Decision:** Use CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` for responsive behavior, or explicit breakpoints matching existing `ProductGrid`.

**Rationale:** Matches existing `ProductGrid` responsive behavior (1 col mobile, 2 tablet, 4 desktop). Consistency with catalog page.

### 3. Section Placement

**Decision:** Insert featured products section between hero and categories section in `page.tsx`.

**Rationale:** User explicitly wants products prioritized. Hero → Featured Products → Categories → Why Choose Us creates logical flow: brand → products → browse by category → trust signals.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| No products in CMS (empty state) | Render fallback message "Próximamente más productos" with link to `/catalogo` |
| Images not loading (depth insufficient) | Ensure `depth: 2` in query; test with seeded data |
| Performance: extra API call on home page | Home page already dynamic (`force-dynamic`); single additional query is negligible. Consider `Promise.all` with categories fetch. |
| ProductCard expects client context (cart) | `ProductCard` is a Client Component; works inside Server Component grid. Verify hydration works. |
| CMS has < 8 products | Grid handles any count gracefully with `auto-fill` |

## Migration Plan

1. Add `queryFeaturedProducts` to `src/lib/payload.ts`
2. Create `src/components/home/featured-products.tsx` Server Component
3. Update `src/app/(storefront)/page.tsx` to import and render `FeaturedProducts` between hero and categories
4. Test with dev server (`npm run dev`) against local MongoDB
5. Verify production build (`npm run build`)
6. Deploy via `deploy-prod.sh` (rebuilds Docker image)

**Rollback:** Revert `page.tsx` to previous version (git checkout) - no database migrations needed.

## Open Questions

1. Should the section title be "Productos Destacados" or "Novedades"? (Can decide during implementation)
2. Should we show product ratings in the featured grid? (ProductCard already supports this)