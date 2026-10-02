# cart-management Specification

## Purpose

Lets a customer accumulate products from the catalog and product page into a cart that survives a page reload, and review and edit that selection before checkout.

## Requirements

### Requirement: Products reachable from the catalog grid
The system SHALL render every catalog product card as a link to that product's own page, so a customer can reach product details by clicking the card anywhere on it.

#### Scenario: Customer clicks a catalog card
- **WHEN** a customer clicks anywhere on a product card in the catalog grid
- **THEN** the system navigates to that product's detail page

### Requirement: Add a product to the cart from the catalog
The system SHALL let a customer add a product to the cart from its catalog card without leaving the catalog.

#### Scenario: Customer adds from the grid
- **WHEN** a customer activates the cart control on a catalog product card
- **THEN** the product is added to the cart with a quantity of one and the customer stays on the catalog page

### Requirement: Add a product with a chosen quantity from the product page
The system SHALL let a customer choose a quantity on a product's detail page and add that many units to the cart.

#### Scenario: Customer picks a quantity and adds
- **WHEN** a customer selects a quantity of three on a product page and activates "agregar al carrito"
- **THEN** three units of that product are added to the cart

#### Scenario: Requested quantity exceeds available stock
- **WHEN** a customer attempts to add a quantity greater than the product's available stock
- **THEN** the system caps the added quantity at the available stock

### Requirement: Adding a product already in the cart
The system SHALL accumulate quantity rather than duplicate the product when a product already in the cart is added again.

#### Scenario: Same product added twice
- **WHEN** a cart already contains two units of a product and the customer adds that product again
- **THEN** the cart contains a single entry for that product with the combined quantity, still capped at available stock

### Requirement: Edit and remove cart lines
The system SHALL let a customer increase or decrease the quantity of any cart line, clamped between one and the product's available stock, and SHALL let a customer remove a line entirely.

#### Scenario: Customer decreases quantity to zero
- **WHEN** a customer decreases the quantity of a cart line and it would fall below one
- **THEN** the system holds that line at a quantity of one

#### Scenario: Customer removes a line
- **WHEN** a customer activates the remove control on a cart line
- **THEN** that line no longer appears in the cart

### Requirement: Cart survives a page reload
The system SHALL restore the customer's cart after a full page reload or a fresh browser tab, and SHALL discard any stored cart that cannot be parsed rather than failing to render.

#### Scenario: Reload with items in the cart
- **WHEN** a customer with three units in the cart reloads the page
- **THEN** the cart shows those same three units

#### Scenario: Stored cart is corrupt
- **WHEN** stored cart data cannot be read or parsed
- **THEN** the system starts the customer with an empty cart and renders the storefront normally

### Requirement: Cart totals are consistent everywhere
The system SHALL compute the cart's item count, subtotal, shipping and total through one shared calculation, so the header, the drawer, `/carrito` and the checkout all show identical figures.

#### Scenario: Cart is shown in two surfaces at once
- **WHEN** a customer has the drawer open and views the header badge
- **THEN** the badge shows the same item count as the drawer lists

#### Scenario: Item count spans multiple lines
- **WHEN** the cart holds two units of one product and three of another
- **THEN** the reported item count is five, not two

### Requirement: Cart entry points visible in site chrome
The system SHALL show the cart's item count in the site header and SHALL let the customer open a slide-over drawer showing the cart's contents from any page.

#### Scenario: Badge reflects cart size
- **WHEN** the cart holds four units in total
- **THEN** the header badge displays four

#### Scenario: Customer opens the drawer
- **WHEN** a customer opens the cart drawer from the header
- **THEN** the drawer lists the current cart lines with their quantities and the order total

### Requirement: Empty cart state
The system SHALL explain that the cart is empty and offer a route back to the catalog whenever the cart has no lines.

#### Scenario: Customer views an empty cart
- **WHEN** a customer opens `/carrito` with nothing added
- **THEN** the system states the cart is empty and offers a link to the catalog

### Requirement: Cart state lives only in the browser
The system SHALL keep cart contents in the customer's browser and SHALL NOT require an account, a session or a network round-trip to read or modify it.

#### Scenario: Anonymous customer builds a cart
- **WHEN** a customer who has never signed in adds and removes products
- **THEN** every change takes effect without authentication

### Requirement: Out-of-stock product added from a stale catalog
The system SHALL accept the stock value the customer saw when adding a product, and SHALL NOT prevent adding on the basis of a freshly fetched stock level.

#### Scenario: Stock changed after the page was rendered
- **WHEN** the catalog page shows a product as available and stock is exhausted before the customer clicks add
- **THEN** the product is still added, and the discrepancy is left for an admin to reconcile
