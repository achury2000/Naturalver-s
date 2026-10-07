# home-page-featured-products Specification

## Purpose

Displays a curated featured product grid on the home page that pulls from the Payload CMS, with configurable selection criteria and responsive grid layout.

## Requirements

### Requirement: Home page displays featured products from CMS

The home page SHALL render a featured products section that pulls product data from the Payload CMS via the REST API.

#### Scenario: Featured products section renders on home page
- **WHEN** user visits the home page
- **THEN** a "Productos Destacados" section appears below the hero section

#### Scenario: Products are fetched from Payload CMS
- **WHEN** the home page loads
- **THEN** products are retrieved via the Payload REST API using the existing products endpoint

#### Scenario: Products link to their detail pages
- **WHEN** user clicks on a featured product
- **THEN** they are navigated to the product detail page at `/[slug]`

### Requirement: Featured products selection is configurable

The featured products displayed SHALL be selectable via configurable criteria (newest, featured flag, best-selling, or manual selection).

#### Scenario: Newest products are shown by default
- **WHEN** no specific featured products are configured
- **THEN** the 8 newest products (by createdAt descending) are displayed

#### Scenario: Featured flag takes precedence when set
- **WHEN** products have a featured flag enabled in CMS
- **THEN** featured products are shown first, then newest to fill remaining slots

#### Scenario: Maximum of 8 products displayed
- **WHEN** more products match the criteria
- **THEN** only the first 8 products are shown in the grid

### Requirement: Featured products grid is responsive and accessible

The featured products grid SHALL be responsive across device sizes and meet accessibility standards.

#### Scenario: Grid adapts to viewport width
- **WHEN** viewport is mobile (< 640px)
- **THEN** products display in a single column
- **WHEN** viewport is tablet (640px - 1024px)
- **THEN** products display in 2 columns
- **WHEN** viewport is desktop (> 1024px)
- **THEN** products display in 4 columns

#### Scenario: Product cards meet accessibility standards
- **WHEN** a product card is rendered
- **THEN** it includes proper alt text for images
- **THEN** it has sufficient color contrast (AA)
- **THEN** it is keyboard navigable
- **THEN** focus indicators are visible

### Requirement: Featured products section appears after hero

The featured products section SHALL appear between the hero slider and the "Why Choose Us" section on the home page. The home page does NOT include a categories section (categories remain reachable via header, footer and `/catalogo`).

#### Scenario: Section order is correct
- **WHEN** user scrolls the home page
- **THEN** sections appear in order: Hero → Featured Products → Why Choose Us
- **THEN** no categories section is rendered on the home page