# Spec Delta

## MODIFIED Requirements

### Requirement: Catalog reads from the CMS

The storefront SHALL render product listings, detail pages, search results, **and home page featured products** using data returned by the Payload REST API rather than static fixtures.

#### Scenario: Featured products on home page use CMS data
- **WHEN** the home page loads the featured products section
- **THEN** products are retrieved via the Payload REST API products endpoint
- **THEN** no static/hardcoded product data is used

#### Scenario: Product queries request sufficient depth for images
- **WHEN** querying products for the home page featured section
- **THEN** the query SHALL request depth sufficient to resolve upload relations to URL objects
- **THEN** images render without placeholders