# Tasks

## 1. Data Layer - Add Featured Products Query

- [x] 1.1 Add `queryFeaturedProducts` function to `src/lib/payload.ts` that wraps `queryProducts` with defaults: `sort: '-createdAt'`, `limit: 8`, `depth: 2`. **Verify:** Function exists and TypeScript compiles.
- [x] 1.2 Export `queryFeaturedProducts` from `src/lib/payload.ts`. **Verify:** Import works in other files without TypeScript errors.

## 2. Featured Products Component

- [x] 2.1 Create `src/components/home/featured-products.tsx` as a Server Component that:
  - Imports `queryFeaturedProducts` from `@/lib/payload`
  - Fetches products via `await queryFeaturedProducts()`
  - Renders responsive grid using existing `ProductCard` component
  - Handles empty state gracefully (shows "Próximamente más productos" with link to `/catalogo`)
  - Uses Section + Container layout components for consistency. **Verify:** Component renders without errors in dev server.
- [x] 2.2 Ensure `ProductCard` works correctly inside the grid (images load, add-to-cart button works, links to `/[slug]`). **Verify:** Manual test in browser - click product navigates to detail page, add-to-cart works.

## 3. Home Page Integration

- [x] 3.1 Update `src/app/(storefront)/page.tsx` to import and render `FeaturedProducts` component between the hero section and the categories section.
- [x] 3.2 Remove the hardcoded "Por qué elegirnos" section or keep it below categories (decide during implementation - design suggests keeping it below categories).
- [x] 3.3 Ensure section order: Hero → Featured Products → Categories → Why Choose Us. **Verify:** Visual inspection in browser shows correct section order.

## 4. Styling & Responsiveness

- [x] 4.1 Verify featured products grid is responsive: 1 col mobile (<640px), 2 cols tablet (640-1024px), 4 cols desktop (>1024px). **Verify:** Resize browser window, check grid adapts correctly. (Verified: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` via `ProductGrid className="lg:grid-cols-4"`; HTML confirms classes.)
- [x] 4.2 Ensure product images load correctly (depth=2 in query resolves image URLs). **Verify:** No placeholder images shown for featured products. (Verified: restored `media/*.jpg` from git — they were SVG content with `.jpg` ext and served `text/plain`; rasterized to real JPEGs with sharp. Made `getImageUrl` return same-origin `/api/media/**` paths so URLs don't point at a different port. Dev + prod image optimizer return `200 image/jpeg`.)
- [x] 4.3 Verify accessibility: focus indicators visible, alt text present, keyboard navigation works. **Verify:** Tab through products, check focus rings, screen reader reads product names. (Verified: added `focus-visible:ring-2 ring-brand-dark` to the product image link and the add-to-cart button; `alt` attributes present; links use `aria-label` with product name.)

## 5. Empty State & Edge Cases

- [x] 5.1 Implement empty state in `FeaturedProducts` component: when `products.length === 0`, show message "Próximamente más productos" with link to `/catalogo`. **Verify:** Test by temporarily returning empty array from query. (Verified: temporarily forced `products = []`; empty message + `/catalogo` link rendered, then reverted.)
- [x] 5.2 Handle case where CMS has fewer than 8 products. **Verify:** Grid renders correctly with 1-7 products. (Verified: CMS has 6 products; grid renders all 6 with no blank cells.)

## 6. Verification & Build

- [x] 6.1 Run `npm run typecheck` - passes with 0 errors.
- [x] 6.2 Run `npm run dev` and verify home page loads at `http://localhost:3005` with featured products section visible.
- [x] 6.3 Run `npm run build` - production build succeeds. (Note: `/` had to become `force-dynamic`; static prerender made `queryFeaturedProducts` throw at build time.)
- [x] 6.4 Deploy to production via `docker compose -f compose.prod.yaml build --no-cache app && docker compose -f compose.prod.yaml up -d --force-recreate app` and verify at `http://localhost:3000`. (Verified: home `200`, section order Hero → Featured → Categories → Why, product images resolve through `/_next/image`.)

## 7. Optional Enhancements (Post-MVP)

- [x] 7.1 Add "Productos Destacados" section title with consistent styling (font-heading, text-3xl, font-bold).
- [x] 7.2 Consider adding "Ver todo el catálogo" link at bottom of featured products section linking to `/catalogo`.