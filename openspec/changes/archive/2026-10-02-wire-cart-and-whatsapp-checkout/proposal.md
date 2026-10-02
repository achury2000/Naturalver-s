# Proposal

## Why

The storefront cannot take a single order. `CartContext` is fully implemented (add, remove, update, clear, totals) but nothing consumes it: the cart button in `product-card.tsx` has no `onClick` and the card is a plain `div` rather than a `next/link`, so products are not even reachable by URL from the grid; the "agregar al carrito" button in `[slug]/page.tsx:84` is inert; `/carrito` is a static page that unconditionally renders "Tu carrito está vacío"; `cart-drawer.tsx` holds its own hardcoded fake `useState` array instead of reading context; and with no persistence, any state would be lost on reload. `/pago` renders "Forma de pago no disponible" and `/confirmacion` is a static thank-you, so no `Orders` document is ever created.

This change connects the cart end to end and closes the sale through WhatsApp: the customer fills in their details, the order is persisted in Payload so it is visible in the admin, and WhatsApp opens with the order summary pre-filled for the business to confirm payment and delivery.

## What Changes

- **Add-to-cart from the catalog grid.** `product-card.tsx` becomes a `next/link` to the product page and its cart icon button calls `addItem`. Also replace the raw `<img>` + hardcoded `placehold.co` fallback with `getImageUrl()`, and delete the local `StarRating` duplicate in favour of the existing `catalog/star-rating.tsx`.
- **Add-to-cart from the product detail page.** Wire the existing inert button in `[slug]/page.tsx` and add a `quantity-selector` so the customer can pick units before adding.
- **Persist the cart in `localStorage`.** Hydrate on mount and write on change, so a reload does not silently discard the cart.
- **Make `/carrito` real.** Render actual cart contents with the already-written (currently dead) `cart-item`, `quantity-selector` and `cart-summary` components, plus an empty state that links back to the catalog.
- **Rewrite `cart-drawer.tsx` to consume `CartContext`** instead of its hardcoded demo items, and mount it from `site-layout.tsx` so it is reachable.
- **Add a cart badge with the item count to the header**, next to the existing `/carrito` link.
- **Extract the shipping rule** currently hardcoded in the dead `cart-drawer.tsx` (free over 100.000 COP, otherwise 15.000 COP) into `src/lib/` so the drawer, `/carrito` and `/pago` all agree.
- **Replace `/pago` with a checkout form** (name, phone, address, city, department, zip) that shows the order totals and submits the order.
- **Create a real `Orders` document on checkout**, via `POST /api/orders`, with `status: 'pending'` and `paymentMethod: 'whatsapp'`.
- **Open `Orders.create` to anonymous storefront clients.** `Orders.ts` currently restricts `read/create/update/delete` to `role === 'admin'`, so no customer can ever create an order. `read`/`update`/`delete` stay admin-only.
- **Add a `whatsapp` option to the `paymentMethod` select** so the admin can tell these orders apart from card or contrarecibo sales.
- **Build the WhatsApp handoff** from `NEXT_PUBLIC_WHATSAPP_NUMBER`, opening `wa.me` with the order number, line items and total pre-filled, then clearing the cart.
- **Replace the hardcoded `https://wa.me/573106198912` in `/contacto`** with the same environment variable.
- **Make `/confirmacion` show the created order's number and status** instead of static copy.

## Capabilities

### New Capabilities

- `cart-management`: The client-side shopping cart holds the customer's selections and exposes them across the storefront. Covers the add-to-cart entry points on the catalog grid and product detail page, quantity changes and removal, persistence across reloads, the header badge, and the slide-over drawer. The cart never becomes the source of truth for an order; it is input to checkout.
- `whatsapp-checkout`: A customer completes a purchase without an online payment gateway. Covers the checkout form and its validation, shipping and total computation, creation of a persisted `Orders` document with the access rules that make that possible, the `wa.me` hand-off carrying the order summary, and the confirmation screen.

### Modified Capabilities

None. `catalog-data` and `cms-admin` are declared by the in-progress `wire-payload-cms` change and have no specs under `openspec/specs/` yet, so there is nothing to amend. This change builds on that work rather than altering it.

## Impact

**Affected components**

- `src/components/catalog/product-card.tsx` - becomes a link, gains an add-to-cart handler, drops the duplicated `StarRating`
- `src/components/catalog/search-bar.tsx`, `star-rating.tsx` - unchanged, only referenced
- `src/components/cart/cart-drawer.tsx` - rewritten to read context
- `src/components/cart/cart-item.tsx`, `cart-summary.tsx`, `quantity-selector.tsx` - unchanged, reconnected
- `src/components/layout/header.tsx`, `site-layout.tsx` - badge and drawer mount point
- `src/app/(storefront)/carrito/page.tsx`, `pago/page.tsx`, `confirmacion/page.tsx` - all become stateful; `carrito` and `pago` must stop being prerendered
- `src/app/(storefront)/[slug]/page.tsx` - wire the existing button
- `src/app/(storefront)/contacto/page.tsx` - WhatsApp link from the environment

**Data and config**

- `src/contexts/CartContext.tsx` - `localStorage` persistence
- `src/lib/` - new shipping/total helpers, replacing logic embedded in the dead drawer
- `src/collections/Orders.ts` - **`access.create` opens to anonymous clients**, `paymentMethod` gains an option
- `src/types/payload.ts` - regenerate with `npx payload generate:types` after touching collections
- `.env.example` - documents `NEXT_PUBLIC_WHATSAPP_NUMBER`

**Boundaries**

- No payment gateway, no card form, no online transaction.
- No customer authentication: checkout is anonymous, so `Orders.customer` stays unset.
- No stock reservation. The cart validates against the `stock` value carried at add time; nothing decrements `Products.stock`, so overselling stays possible until an admin adjusts stock. Addressing this means touching `catalog-data`, so it is left out deliberately.
- No email notifications. Payload still runs without an email adapter.