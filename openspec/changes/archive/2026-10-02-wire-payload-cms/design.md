# Design

## Context

See `proposal.md` — Why, and the specs for requirements. Only the current state that constrains the approach belongs here.

**Current Payload state** — `payload.config.ts` defines six collections with domain-specific fields (`ingredients`, `benefits`, `usage` steps, `rating`, `features`) but is dead: no `(payload)` route group, no `route.ts`, no `/admin`. Six collection files import from `'@payloadcms/payload'` (does not exist; types are in `payload`). ~30 fields have `localized: true` with no `i18n` block → Payload 3 throws at startup. `payload.config.ts:28` uses `outfile` (Payload 3 expects `outputFile`). `Orders` has fully open access. `src/lib/payload.ts` contains a process-wide `useMock` latch. `catalogo/page.tsx` imports mocks directly and runs filters/search/sort in the client. `next.config.js` allows remote images only from `placehold.co` and `res.cloudinary.com`; Payload serves uploads at `/api/media/file/...` (same-origin, no `remotePatterns` change needed).

**Content** — `mock-data.ts` holds 6 products with `name`, `slug`, `description`, `price`, `compareAtPrice`, `category` (object with `id`/`name`), `images` (array of `{ image: { url }, alt }`), `stock`, `inStock`, `rating`, `reviewCount`, `newArrival`, `featured`, `ingredients`, `benefits`, `usage`, `features`. 4 categories: `cat1`–`cat4`. Mock images use `placehold.co`.

**Visuals** — `tailwind.config.ts`, `globals.css`, `layout.tsx`, `Header.tsx`, `Footer.tsx`, `Logo.tsx`, `ProductCard.tsx`, `ProductGrid.tsx` all define the design shell. This change touches **zero** visual files.

## Goals / Non-Goals

**Goals**

- Wire the existing Payload config so `/api` and `/admin` exist and serve the six collections.
- Preserve the live catalog exactly: seed from `mock-data.ts` so prices, images, badges, ratings, and all domain fields are identical.
- Make the catalog read from the CMS: `catalogo/page.tsx` and `[slug]/page.tsx` become Server Components calling `queryProducts` / `queryProductBySlug` with `depth` so images render.
- Eliminate silent failures: remove the `useMock` latch; failures surface as errors.
- Close the `Orders` access hole before the admin mounts.
- Keep all visual files unchanged.

**Non-Goals**

- Any payment gateway, WhatsApp checkout, or cart persistence (out of scope — the repo has none today).
- Multi-language / i18n support (the site is Spanish-only; `localized` is removed).
- Adopting the official Payload "ecommerce" template (would flatten the domain-specific collections).
- Modifying the design system (`tailwind.config.ts`, `globals.css`, `layout.tsx`, component styles).
- Adding a dark theme (`darkMode: 'class'` is configured but unimplemented).
- Fixing pre-existing typecheck errors unrelated to this change (`Text.tsx:21`, `layout.tsx:15`).

## Decisions

### Keep the existing custom collections instead of adopting the ecommerce template

**Decision.** Retain the six hand-written collections (`Products`, `Categories`, `Orders`, `Users`, `Pages`, `Media`) exactly as modeled, with their domain-specific fields (`ingredients`, `benefits`, `usage`, `features`, `rating`, `featured`, `newArrival`, `compareAtPrice`). Mount Payload via `(payload)/route.ts` rather than regenerating from the template.

**Rationale.** The `Products` collection encodes a supplement catalog (ingredients list, usage steps, benefits, rating) that the generic ecommerce template does not cover. Regenerating would discard the model and force a reimplementation. The current collections already compile once the import is fixed; wiring them is faster and preserves domain fidelity.

**Alternatives considered.** Run `/new-payload-ecommerce` and map the custom fields afterward — rejected: more work, higher risk of visual regression, no benefit for a read-only catalog.

**Consequence.** The admin panel reflects the current schema. No auto-generated "cart" or "checkout" collections exist — correct, since the frontend has no cart persistence.

### Remove `localized: true` instead of adding i18n

**Decision.** Strip `localized: true` from all ~30 fields across the six collections. Do not add an `i18n` block to `payload.config.ts`.

**Rationale.** The entire site is Spanish: `<html lang="es">`, all copy in Spanish, prices in COP. i18n adds a locale dimension to every query, every field access, and the generated types — for a language that does not exist. Payload 3 returns localized fields as `{ es: "value" }` objects depending on `i18n` config, which would render as `[object Object]` in `ProductCard` and `Footer` headings. Removing `localized` makes fields plain strings, eliminates the startup error, and avoids the locale-object rendering bug entirely.

**Alternatives considered.** Add `i18n: { supportedLanguages: { es: { label: "Español" } }, defaultLanguage: "es" }` and pass `?locale=es` on every query — rejected: permanent complexity for a hypothetical second language. If a second language is needed later, it is a clean migration (add `localized`, add `i18n`, run a data migration), whereas retrofitting 30 fields from `{ es: "..." }` objects is messy.

**Consequence.** The `typescript` output types become simpler (no `Localized<string>`). The `slug` field on `Products` and `Categories` becomes a plain string, which simplifies the slug lookup in `[slug]/page.tsx`.

### Replace the silent `useMock` latch with explicit error propagation

**Decision.** Rewrite `src/lib/payload.ts` so `payloadFetch` throws on non-2xx and no `useMock` state exists. `queryProducts`, `queryProductBySlug`, `queryCategories` propagate the error. `queryPageBySlug` returns `null` on error (graceful degradation for CMS pages). The `getMockProducts` / `getMockProductBySlug` / `getMockCategories` helpers are removed from the exported API (they remain in `mock-data.ts` only for seeding).

**Rationale.** The current latch silently swallows failures after the first error, making it impossible to verify the CMS is working during development. Explicit errors are visible in the server console and the browser, enabling fast feedback.

**Alternatives considered.** Keep a `useMock` flag for local development — rejected: it was the source of "works on my machine but not in prod" confusion. A seed script makes the CMS the single source of truth from the first deploy.

**Consequence.** If MongoDB is down, the catalog page 500s instead of showing stale mocks. This is the desired behavior — it forces the operator to fix the DB.

### Migrate `catalogo/page.tsx` to a Server Component with `depth`

**Decision.** Rewrite `src/app/catalogo/page.tsx` as a Server Component (remove `'use client'`). It calls `queryProducts` with `limit`, `page`, `where`, `sort`, and `depth=2`. The category filter sends the category ID (from the relationship). Search uses `where[name][like]`. Sort maps the UI values to Payload sort strings. `ProductGrid`, `ProductCard`, `Pagination`, `SearchBar`, `CategoryFilter`, `ProductSort` are preserved as-is; they receive the same `product` objects.

**Rationale.** Server Components are the natural place for data fetching in Next.js 15 App Router. `depth=2` ensures `images[].image` populates to an object with `url`. The category relationship ID is looked up from the `categories` query (by `slug` or `name`).

**Alternatives considered.** Keep as Client Component and call an API route — rejected: extra hop, no benefit. Next.js Server Components are the idiomatic pattern.

**Consequence.** The page loses `useState`/`useMemo` for client-side filtering/search/sort; those operations now hit the API on every interaction (via search params and `router.push`). This is standard SSR behavior.

### Seed the database from `mock-data.ts`

**Decision.** Create a standalone seed script (`scripts/seed.ts`) that connects to MongoDB, clears the `products`, `categories`, `media` collections, inserts the 4 categories (by slug), uploads/links the 6 `placehold.co` images as Payload `Media` documents (or stores the URLs directly), and inserts the 6 products with all fields. Run once after `pnpm dev` starts and MongoDB is available.

**Rationale.** A seed script guarantees the live catalog is byte-identical to the mocks. It is idempotent (clears then inserts) and versioned in the repo. Future content changes happen in the admin; the seed is the one-time bootstrap.

**Alternatives considered.** Manual admin entry — rejected: 6 products × 18 fields × 4 categories is error-prone and not repeatable. `payload db:seed` command — not available in Payload 3.

**Consequence.** The seed script is a one-time migration. After the first run, content lives in the DB and edits go through the admin. The script remains in the repo for fresh environments.

### Fix the six collection imports and the `outputFile` key

**Decision.** In each of the six `src/collections/*.ts` files, change `import { CollectionConfig } from '@payloadcms/payload'` to `import { CollectionConfig } from 'payload'`. In `payload.config.ts:28`, change `outfile` to `outputFile`.

**Rationale.** These are the only two config fixes required to make the codebase type-check and Payload boot.

**Consequence.** The 6 import errors and the `outfile` type error vanish. The `src/types/payload.ts` file is generated on first `pnpm dev` or `payload generate:types`.

### Close `Orders` access before the admin mounts

**Decision.** Change `Orders` collection `access` from `{ read: () => true, create: () => true, update: () => true, delete: () => true }` to `{ read: ({ req }) => req.user?.role === 'admin', create: ({ req }) => req.user?.role === 'admin', update: ({ req }) => req.user?.role === 'admin', delete: ({ req }) => req.user?.role === 'admin' }` (or equivalent Payload 3 access control syntax). The `Users` collection already has an `admin` role field (standard Payload pattern).

**Rationale.** The current open access turns `Orders` into a live data hole the moment `/admin` is reachable. Closing it is a prerequisite for mounting the admin.

**Consequence.** Frontend order creation (which does not exist yet) would need a separate access rule when implemented. For now, the admin is the only writer.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| MongoDB unavailable in some environments | Document `MONGODB_URI` in `.env.example`; provide a Docker Compose snippet for local dev |
| `depth=2` increases response size | Only the catalog and product detail endpoints use it; response size remains small (6 products × ~2KB) |
| Seed script is one-way | Run only on fresh DB; admin is the ongoing editor. Keep script in repo for new environments. |
| `useMock` removal means no fallback | Desired — forces DB availability. If a read-only fallback is ever needed, add a circuit-breaker with metrics, not a silent latch. |
| `Orders` closed access blocks future frontend order creation | When checkout is built, add a separate `create` rule for authenticated customers. Today it is correct. |
| `placehold.co` images as media URLs vs. uploading | Storing the `placehold.co` URLs directly in the `Media` `url` field avoids upload bandwidth and works because `placehold.co` is in `remotePatterns`. If Payload requires local uploads, download and upload in the seed script (adds complexity). |
| `localized` removal means future i18n requires migration | Accepted — migration is cleaner than carrying the debt. |

## Migration Plan

1. **Commit current state** (already done: `8d413d7`).
2. **Fix imports + `outputFile`** in `payload.config.ts` and 6 collections → `npm run typecheck` passes the new errors.
3. **Strip `localized: true`** from all fields → Payload boots.
4. **Add `(payload)/route.ts`** mounting `@payloadcms/next` with `admin: { user: 'users' }`.
5. **Close `Orders` access** → admin mounts safely.
6. **Start MongoDB** (Docker: `docker run -d -p 27017:27017 mongo:7`).
7. **Run seed script** (`tsx scripts/seed.ts`) → DB populated with 4 categories + 6 products + media.
8. **Rewrite `src/lib/payload.ts`** — remove `useMock`, throw on error, export `queryProducts` / `queryProductBySlug` / `queryCategories` with `depth=2`.
9. **Migrate `catalogo/page.tsx`** to Server Component using `queryProducts`; preserve all child components.
10. **Migrate `[slug]/page.tsx`** to use `queryProductBySlug` with `depth=2`.
11. **Add `NEXT_PUBLIC_PAYLOAD_API_URL`** to `.env.example` (defaults to `/api`).
12. **Verify**: `npm run typecheck` (no new errors), `npm run dev` — catalog loads, images render, category filter works, search works, sort works, product detail loads, `/admin` reachable and shows 6 products.
13. **Rollback**: Revert commits 2–10. The old `catalogo/page.tsx` (Client Component + mocks) and `src/lib/payload.ts` (with `useMock`) are in git history. No database rollback needed (seed is idempotent insert on fresh DB).

## Open Questions

- **Sort mapping**: The mock `sort` values (`popular`, `newest`, `name_asc`, `name_desc`, `price_asc`, `price_desc`) need a mapping to Payload sort strings. `popular` has no direct field — should a `sortOrder` numeric field be added to `Products` and seeded descending? If not, default to `createdAt` desc.
- **Media URLs**: Should the seed script download `placehold.co` images and upload them as Payload `Media` (local files), or store the remote URLs directly? Remote URLs work with the current `next.config.js`; local uploads avoid external dependency. Lean toward remote URLs for simplicity, but document the trade-off.
- **Future i18n**: When (not if) a second language is requested, the migration is: add `i18n` block → add `localized: true` back to target fields → run a data migration converting plain strings to `{ es: "..." }` → update queries to pass `locale`. This is a separate change.
- **Multi-tenant / locales**: Not in scope.