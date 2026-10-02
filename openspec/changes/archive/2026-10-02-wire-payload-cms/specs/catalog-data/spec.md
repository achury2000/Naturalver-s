# Spec Delta

## Purpose

The storefront reads its catalog data from Payload CMS. This capability covers data source fidelity (images, localized values as plain strings, relationship filters), failure visibility (no silent fallback to mock data), and content preservation (seeded catalog matches current fixtures field by field).

## ADDED Requirements

### Requirement: Catalog reads from the CMS

The storefront SHALL render product listings, detail pages, and search results using data returned by the Payload REST API rather than static fixtures.

#### Scenario: Catalog page requests products over the REST API
- **WHEN** the catalog page loads
- **THEN** product data is fetched from `/api/products` via a server-side query
- **AND** no component imports mock data directly

#### Scenario: Product detail page resolves by slug
- **WHEN** a user navigates to `/product-slug`
- **THEN** the product is retrieved via `/api/products?where[slug][equals]=product-slug&limit=1`
- **AND** the page renders the same fields (name, description, price, compareAtPrice, images, rating, reviewCount, newArrival, featured, ingredients, benefits, usage, features)

#### Scenario: Free-text search is executed server-side
- **WHEN** a user submits a search query
- **THEN** the query is passed to the Payload API `where[name][like]` filter
- **AND** results are returned without client-side filtering of a full dataset

### Requirement: Failures are visible, not silently absorbed

The storefront SHALL surface Payload API failures as errors rather than substituting mock data.

#### Scenario: A failed request surfaces an error instead of substituting fixtures
- **WHEN** the Payload API returns a non-2xx response or is unreachable
- **THEN** the server component propagates the error (or renders an error boundary)
- **AND** the client never receives a silently substituted mock array

#### Scenario: The fallback latch cannot persist across requests
- **WHEN** a request fails and then a subsequent request succeeds
- **THEN** the second request reads from the CMS, not from the cached mock fallback

### Requirement: Related records are populated

Product queries SHALL request sufficient depth so that upload relations resolve to URL objects and images render without placeholders.

#### Scenario: Product images resolve to a URL
- **WHEN** a product with images is queried
- **THEN** the `images[].image` field contains an object with a `url` property
- **AND** `ProductCard` renders the image from that URL, not the generic placeholder

#### Scenario: The upload relation is requested at depth > 0
- **WHEN** the product query is constructed
- **THEN** it includes `depth=2` (or the minimum required depth) so nested uploads populate

### Requirement: Relationship filters use identifiers

Category filtering SHALL match against the relationship identifier, not a display name.

#### Scenario: Category filter matches a relationship, not a display name
- **WHEN** a user selects a category in the catalog filter
- **THEN** the query uses `where[category][equals]=<category-id>`
- **AND** results include products linked to that category ID

### Requirement: Existing catalog content survives the migration

Seeded data SHALL match the current fixtures field by field so the live catalog is visually identical after the switch.

#### Scenario: Seeded data matches the current fixtures field by field
- **WHEN** the seed script runs against an empty database
- **THEN** every mock product from `src/lib/mock-data.ts` exists in the `products` collection with identical `name`, `slug`, `description`, `price`, `compareAtPrice`, `category` (by slug lookup), `images` (using placehold.co URLs), `stock`, `inStock`, `rating`, `reviewCount`, `newArrival`, `featured`, `ingredients`, `benefits`, `usage`, `features`
- **AND** rendered prices, discount badges, star ratings, and "Nuevo" badges match the current site

#### Scenario: Category list for the filter is sourced from the CMS
- **WHEN** the catalog page loads
- **THEN** the category filter options are populated from the `categories` collection (id, name, slug, order)
- **AND** the active category maps to the relationship ID