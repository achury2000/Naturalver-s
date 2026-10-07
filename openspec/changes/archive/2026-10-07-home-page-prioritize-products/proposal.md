# Proposal

## Why

The current home page (`src/app/(storefront)/page.tsx`) is primarily category-focused with hardcoded categories and a generic "why choose us" section. It doesn't showcase actual products from the catalog, making it difficult for visitors to immediately see what products are available. The user wants to prioritize products on the home page so visitors can see featured/best-selling/new products immediately upon landing.

## What Changes

- Replace the hardcoded category grid with a dynamic featured products section that pulls from the CMS
- Keep categories but make them secondary (e.g., as a "Shop by category" section below featured products)
- Featured products section should show 4-8 products from the CMS (newest, best-selling, or manually featured)
- Products should link to their detail pages (`/[slug]`)
- Maintain the existing "Por un mundo mejor" hero section
- Categories section becomes "Shop by category" with dynamic CMS data (already implemented in previous change)

## Capabilities

### New Capabilities

- `home-page-featured-products`: Display a curated/featured product grid on the home page that pulls from the Payload CMS, with configurable selection criteria (newest, featured flag, best-selling) and responsive grid layout.

### Modified Capabilities

- `catalog-data`: The home page will now query products in addition to categories, extending the existing data-fetching patterns.

## Impact

- **Code**: `src/app/(storefront)/page.tsx` - major rewrite of the categories section to include featured products
- **Data layer**: `src/lib/payload.ts` - may need a new `queryFeaturedProducts` function or extend `queryProducts`
- **Components**: May need new product card variants or reuse existing `ProductCard`
- **CMS**: Products may need a "featured" boolean field or rely on existing fields (newest, rating)
- **API**: No new endpoints needed, uses existing Payload REST API