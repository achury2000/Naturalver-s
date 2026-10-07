// Fixtures used only by `npm run seed` to bootstrap the database.
//
// The data lives in `catalog.json` (not in a .ts file) for one reason:
// the idempotent production seed (`scripts/seed-idempotent.mjs`) must run
// with plain `node` inside the runtime image, where TypeScript and the
// `tsx` devDependency are NOT installed. A .json file is the only shape
// that is importable by both `tsx` (local dev) and bare `node` (prod).
//
// This module stays as the typed entry point so `scripts/seed.ts`
// keeps working unchanged. There is a single source of truth: catalog.json.
import catalog from './catalog.json';

export const mockProducts = catalog.products;
export const mockCategories = catalog.categories;
export const mockHomeBanners = catalog.homeBanners;
