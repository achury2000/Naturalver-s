# Proposal

## Why

The storefront currently reads its catalog from `src/lib/mock-data.ts` — a static array baked into the client bundle. `catalogo/page.tsx` imports the mock data directly and performs filtering, search, and sorting in the browser. A Payload CMS configuration (`payload.config.ts`) exists with six domain-specific collections (Products with `ingredients`, `benefits`, `usage` steps, `rating`; Categories, Orders, Users, Pages, Media) but it is completely unwired: no `(payload)` route group, no `route.ts`, and the REST API and `/admin` do not exist. The collections also import from a non-existent package (`@payloadcms/payload`), declare `localized: true` on ~30 fields without an `i18n` block (Payload 3 throws at startup), and use an outdated config key (`outfile` vs `outputFile`). The `Orders` collection has `access: { read/create/update/delete: () => true }` — fully open. `src/lib/payload.ts` contains a `useMock` latch that permanently switches to mock data after the first failure. This change wires the existing Payload configuration so the catalog becomes editable in the admin panel without losing the current visual design or catalog content.

## What Changes

- Mount Payload at `/api` and `/admin` via `(payload)/route.ts` (NEW capability: `cms-admin`)
- Fix the six collection imports (`@payloadcms/payload` → `payload`)
- Fix `payload.config.ts:28` `outfile` → `outputFile`
- Remove `localized: true` from all ~30 fields (the site is Spanish-only; i18n is not needed and would cause locale-object rendering bugs)
- Close `Orders` access: restrict read/create/update/delete to authenticated admin users before the admin is reachable
- Add `depth: 2` (or appropriate) to product/category queries so upload relations populate and images render
- Migrate `catalogo/page.tsx` from a Client Component using mocks to a Server Component calling `queryProducts` (preserving `ProductGrid`, `ProductCard`, `Pagination`, `SearchBar`, `CategoryFilter`, `ProductSort`)
- Migrate `[slug]/page.tsx` to use `queryProductBySlug` with proper depth
- Replace the silent `useMock` latch in `src/lib/payload.ts` with explicit error propagation
- Seed the database from the current `mock-data.ts` fixtures so the live catalog is byte-identical after migration
- Add `NEXT_PUBLIC_PAYLOAD_API_URL` to `.env.example` (currently undocumented but read by the client)

**BREAKING** — `catalogo/page.tsx` is rewritten from a Client Component to a Server Component; `src/lib/payload.ts` API changes (no more `useMock` fallback).

## Capabilities

### New Capabilities

- `catalog-data`: The storefront reads its catalog data from Payload CMS. Covers data source, shape fidelity (images, localized values as plain strings, relationship filters), and failure visibility (no silent fallback).
- `cms-admin`: Payload CMS boots and serves a reachable admin panel with proper access control. Covers REST API exposure, type-safe generated types, configuration consistency (no localization without i18n), and privileged collection protection.

### Modified Capabilities

- (none — no existing specs in this repo)

## Impact

- **Code**: `payload.config.ts`, 6 collection files, `src/lib/payload.ts`, `src/app/(payload)/route.ts` (new), `src/app/catalogo/page.tsx`, `src/app/[slug]/page.tsx`, `.env.example`, seed script (new)
- **Dependencies**: None added — `@payloadcms/next`, `payload`, `@payloadcms/db-mongodb`, `@payloadcms/richtext-lexical`, `mongodb` already in `package.json`
- **Runtime**: Requires MongoDB at `MONGODB_URI` (dev default `mongodb://localhost:27017/naturalvers`)
- **Visuals**: Zero changes. `tailwind.config.ts`, `globals.css`, `layout.tsx`, `Header.tsx`, `Footer.tsx`, `Logo.tsx`, `ProductCard.tsx`, `ProductGrid.tsx`, formatting helpers — all untouched. The catalog looks identical because it renders the same components with the same data.
- **Content**: Preserved exactly by seeding from the current mocks (`name`, `slug`, `description`, `price`, `compareAtPrice`, `category`, `images`, `stock`, `inStock`, `rating`, `reviewCount`, `newArrival`, `featured`, `ingredients`, `benefits`, `usage`, `features`).
- **Typecheck**: The 6 `@payloadcms/payload` import errors and the `outfile` error disappear; pre-existing `Text.tsx:21` and `layout.tsx:15` errors remain unchanged.