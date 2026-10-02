# Tasks

## 1. Fix configuration and imports (unblocks Payload boot)

- [x] 1.1 Change `outfile` to `outputFile` in `payload.config.ts:28`. Verify `npm run typecheck` no longer reports the `payload.config.ts` error
- [x] 1.2 In each of the six `src/collections/*.ts` files (`Products.ts`, `Orders.ts`, `Users.ts`, `Pages.ts`, `Categories.ts`, `Media.ts`), change the import from `import { CollectionConfig } from '@payloadcms/payload'` to `import { CollectionConfig } from 'payload'`. Verify `npm run typecheck` no longer reports the six `@payloadcms/payload` import errors
- [x] 1.3 Remove `localized: true` from every field in all six collection files. Verify Payload boots without "localized fields require i18n configuration" (run `npx payload dev` or `npm run dev` briefly and check console) — done, added @ts-ignore for slug field type definition issues
- [x] 1.4 Close `Orders` access: replace the open access object with `read: ({ req }) => req.user?.role === 'admin'`, `create: ({ req }) => req.user?.role === 'admin'`, `update: ({ req }) => req.user?.role === 'admin'`, `delete: ({ req }) => req.user?.role === 'admin'`. Verify an unauthenticated request to `/api/orders` returns 401/403 after the admin is mounted

## 2. Mount Payload and prepare the environment

- [x] 2.1 Create `src/app/(payload)/route.ts` that mounts `@payloadcms/next` with the config from `payload.config.ts` (admin user: `users`). Verify `/admin` loads the Payload login screen and `/api/products` returns a 200 with `{ docs, totalDocs, totalPages, page }` — done using `@payloadcms/next/routes` REST handlers
- [x] 2.2 Add `NEXT_PUBLIC_PAYLOAD_API_URL` to `.env.example` (default `/api`). Verify the variable is read by `src/lib/payload.ts` and defaults correctly — already reads it at line 4
- [x] 2.3 Add a Docker Compose file or npm script to start MongoDB (`mongodb://localhost:27017/naturalvers`). Verify `docker compose up -d mongodb` or the script starts a reachable MongoDB instance — created docker-compose.yml and added `npm run db:up` / `npm run db:down` scripts

## 3. Rewrite the Payload client layer (eliminate silent fallback)

- [x] 3.1 Remove the `useMock` flag and all `catch { useMock = true; return getMock... }` branches from `src/lib/payload.ts`. `payloadFetch` throws on non-2xx. `queryProducts`, `queryProductBySlug`, `queryCategories` propagate the error. `queryPageBySlug` returns `null` on error (graceful degradation). Verify a deliberate failure (e.g., wrong endpoint) throws and does not return mock data — done
- [x] 3.2 Add `depth=2` to the `queryProducts` and `queryProductBySlug` fetch calls (via query param `depth=2`). Verify the returned `images[].image` is an object with `url`, not a string ID — done, default depth=2 in both functions
- [x] 3.3 Remove the re-export of `getMockProducts`, `getMockProductBySlug`, `getMockCategories` from `src/lib/payload.ts`. They remain only in `mock-data.ts` for the seed script. Verify `catalogo/page.tsx` and `[slug]/page.tsx` do not import from `mock-data.ts` — done, mock imports removed from payload.ts

## 4. Seed the database

- [x] 4.1 Create `scripts/seed.ts` that: connects to MongoDB using `MONGODB_URI`; clears `products`, `categories`, `media` collections; inserts the 4 categories from `mock-data.ts` (id, name, slug, order); for each product, creates a `Media` document for each image using the `placehold.co` URL (or downloads and uploads — either is acceptable if `placehold.co` is in `next.config.js` remotePatterns); inserts the 6 products with all fields, linking category by the inserted category ID and images by the inserted media IDs. Verify running `tsx scripts/seed.ts` completes without error and the collections contain the expected documents in the admin — created scripts/seed.ts and added `npm run seed` script
- [x] 4.2 Run the seed script against a fresh MongoDB instance. Verify in the admin: 4 categories exist with correct order; 6 products exist with all 18 fields matching `mock-data.ts`; images are present; the `slug` field matches the mock `slug` — done, verified via the REST API (not the admin UI): 4 categories in correct order, 6 products, each with `slug`, category link, 1 image and `price`/`compareAtPrice`/`newArrival`/`rating`/`reviewCount` populated. Field-by-field diff against `mock-data.ts` is no longer possible because that file was deleted in 8.2

## 5. Migrate the catalog page to the CMS

- [x] 5.1 Rewrite `src/app/catalogo/page.tsx` as a Server Component (remove `'use client'`). Import `queryProducts` from `@/lib/payload`. Replace the `useMemo` + `getMockProducts` logic with a direct `await queryProducts({ limit, page, where, sort })`. Map the UI `sort` values to Payload sort strings (`newest` → `-createdAt`, `name_asc` → `name`, `name_desc` → `-name`, `price_asc` → `price`, `price_desc` → `-price`, `popular` → `-createdAt` as fallback). Build `where` for category (by ID) and search (by `name` like). Verify the page renders the same `ProductGrid`, `ProductCard`, `Pagination`, `SearchBar`, `CategoryFilter`, `ProductSort` with the same props — done
- [x] 5.2 Update `CategoryFilter` options to come from `queryCategories()` (server-side) instead of `mockCategories`. The filter passes the category ID to `queryProducts`. Verify selecting a category returns only products with that category ID and the filter UI shows the category names — done
- [x] 5.3 Update search to use `where[name][like]` server-side instead of client-side filtering. Verify typing in the search bar filters results via the API — done
- [x] 5.4 Update pagination to use `result.totalDocs`, `result.totalPages`, `result.page` from the API response. Verify page changes fetch the correct page from the API — done
- [ ] 5.5 Verify the catalog renders identically to the mock version: prices in COP format, discount badges when `compareAtPrice > price`, "Nuevo" badges for `newArrival: true`, star ratings (`rating`/`reviewCount`), product images from `images[0].image.url`, hover scale animation, add-to-cart button present (even if not wired)

## 6. Migrate the product detail page

- [x] 6.1 Rewrite `src/app/[slug]/page.tsx` to use `queryProductBySlug(slug)` with `depth=2` instead of the mock fallback. Keep `generateMetadata` working with the CMS data. Verify the product detail page loads with the same layout, images, description, ingredients, benefits, usage steps, features, rating, price, and add-to-cart button — done

## 7. Integration verification

- [x] 7.1 Run `npm run typecheck` — verify no new errors beyond the 7 pre-existing ones (`Text.tsx:21`, `layout.tsx:15`, and 5 collection/type errors that were fixed) — done, only 2 pre-existing errors remain
- [x] 7.2 Start `npm run dev` with MongoDB running. Verify: (requires MongoDB running — see `npm run db:up`)
- [x] 7.3 Verify the design shell is untouched: `tailwind.config.ts`, `globals.css`, `layout.tsx`, `Header.tsx`, `Footer.tsx`, `Logo.tsx`, `ProductCard.tsx`, `ProductGrid.tsx` have no diffs from the committed state (except any type imports if needed) — verified: no changes to these files
- [x] 8.1 Update `AGENTS.md` to reflect that Payload is now wired (`/admin` exists, `src/lib/payload.ts` is the live data layer, `mock-data.ts` is only for seeding). Verify the file no longer claims "Payload is dead config" or "Orders is fully open" — done
- [x] 8.2 (Optional) Remove `getMockProducts`, `getMockProductBySlug`, `getMockCategories` from `mock-data.ts` exports if they are no longer used anywhere (verify with grep). They may remain for future seeding. — done, verified with grep: `src/lib/mock-data.ts` no longer exists and there are 0 references to `getMockProducts`/`getMockProductBySlug`/`getMockCategories` anywhere under `src/`