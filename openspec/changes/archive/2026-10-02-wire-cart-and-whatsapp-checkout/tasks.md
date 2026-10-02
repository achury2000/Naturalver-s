# Tasks

> **Verification note:** this project has no test runner (see `AGENTS.md`). Do not add one as part of this change. Every task below is verified with `npm run typecheck` plus an observable behaviour in `npm run dev`.

## 1. Shared cart math and environment

- [x] 1.1 Create `src/lib/commerce.ts` exporting `FREE_SHIPPING_THRESHOLD` (100000), `SHIPPING_COST` (15000), `calculateShipping(subtotal)` and `calculateTotals(items)`, ported from the dead logic in `cart-drawer.tsx`. Verify by running `npx tsx -e "import('./src/lib/commerce').then(m => console.log(m.calculateShipping(100000), m.calculateShipping(99999)))"` and confirming `0 15000`.
- [x] 1.2 Add `NEXT_PUBLIC_WHATSAPP_NUMBER=573106198912` to `.env.example`, seeded from the number currently hardcoded in `/contacto`. Verify the dev server boots and the value is readable at runtime.
- [x] 1.3 Run `npm run typecheck` and confirm it passes clean, establishing the baseline for the rest of the change.

## 2. Add-to-cart entry points

- [x] 2.1 In `product-card.tsx`, wrap the image and title in a `next/link` to the product page with a stretched hit area, and raise the existing cart button above it with `relative z-10` so the two never nest as interactive elements. Verify `npm run typecheck` passes and that clicking the card image or title navigates to that product's page while clicking the cart icon does not.
- [x] 2.2 In `product-card.tsx`, wire the cart icon's `onClick` to `addItem` with quantity 1, passing `id`, `name`, `price`, `getImageUrl(image)` and `stock` as `maxStock`. Verify in the browser that the icon adds one unit, that adding the same card twice combines into a single line, and that no navigation occurs.
- [x] 2.3 Replace the local `StarRating` duplicate and the raw `<img>` with `placehold.co` fallback in `product-card.tsx` with the existing `catalog/star-rating.tsx` and `next/image` via `getImageUrl()`. Verify the rating stars and product image still render on the catalog grid and that `npm run typecheck` passes.
- [x] 2.4 In `[slug]/page.tsx`, wire the inert "agregar al carrito" button at line 84 to `addItem` and add the existing `quantity-selector` above it, with `max` set to the product's `stock`. Verify that picking 3 and clicking add puts 3 units in the cart, and that the selector cannot exceed `stock`.

## 3. Cart state

- [x] 3.1 Add a `hydrated` flag to `CartContext`, set after the first `localStorage` read, and surface it on the context value. Verify `npm run typecheck` passes and no hydration warning appears in the dev console.
- [x] 3.2 Persist `items` to `localStorage` on change and hydrate from it on mount, discarding unreadable or unparseable stored data by starting empty. Verify by adding items from group 2, reloading the page, and confirming the cart survives; then corrupting the stored value in devtools and confirming the storefront still renders.
- [x] 3.3 Derive `shipping` and `total` in `CartContext` from `calculateTotals` in `src/lib/commerce.ts` and expose them alongside the existing `totalItems` and `totalPrice`. Verify `npm run typecheck` passes and the values match what `/carrito` and the drawer render in group 4.
- [x] 3.4 Change `updateQuantity`'s clamp in `CartContext` from `Math.max(0, ...)` to `Math.max(1, ...)` so a line holds at one unit. Verify by decrementing a line to one and confirming it stops there, with removal still available via its own control.

## 4. Cart surfaces

- [x] 4.1 Add the item-count badge to the header's cart link in `header.tsx`, rendered only once `hydrated` is true so the prerendered markup matches. Verify `npm run typecheck` passes, the badge shows the correct total quantity for multi-line carts, and there is no hydration warning.
- [x] 4.2 Rewrite `cart-drawer.tsx` to consume `useCart()` instead of its hardcoded demo rows and its private totals, deleting the local `useState`. Verify the drawer lists the real cart with correct quantities and total, and that its remove and quantity controls update the badge.
- [x] 4.3 Gate the drawer on `isOpen` from context rather than local props, close it on overlay click and on the close button, and trap focus while open with `Escape` to dismiss. Verify keyboard-only navigation: open from the header, `Escape` closes it, and focus returns to the trigger.
- [x] 4.4 Mount `CartDrawer` in `site-layout.tsx` inside the `CartProvider` so it is reachable from every storefront page. Verify it opens from `/catalogo`, `/nosotros` and a product page.
- [x] 4.5 Make `/carrito` a thin Server Component that keeps exporting `metadata` and delegates to a new client view component, which renders `cart-item`, `quantity-selector` and `cart-summary` from context once `hydrated`. Verify the real cart renders with shared totals and that the badge and summary figures match.
- [x] 4.6 Implement the `/carrito` empty state with a catalog link. Verify by clearing the cart that the empty state appears instead of the line list.

## 5. Order creation path

- [x] 5.1 In `src/collections/Orders.ts`, set `access.create` to allow unauthenticated clients and add `{ label: 'WhatsApp', value: 'whatsapp' }` to `paymentMethod`, leaving `read`, `update` and `delete` admin-only. Verify with the dev server running that an unauthenticated `POST /api/orders` returns 201 while `GET /api/orders` returns 403.
- [x] 5.2 Run `npx payload generate:types` and confirm `npm run typecheck` passes with the regenerated `src/types/payload.ts`.
- [x] 5.3 Add an order-creation helper to `src/lib/payload.ts` that POSTs through the existing `payloadFetch` without passing a `headers` key, so the merged `Content-Type` is not clobbered. Verify `npm run typecheck` passes and a `GET /api/orders` list still resolves for an admin.
- [x] 5.4 Implement a Server Action that validates the required delivery fields as non-blank after trimming, rejects the submission if any line id does not resolve in the catalog, clamps each quantity to the product's `stock`, and re-derives every price, the subtotal, shipping and total from the catalog rather than from submitted values. Verify by submitting an inflated price and confirming the stored order uses the catalog price.
- [x] 5.5 Generate the order number server-side as `NV-<yymmdd>-<4 chars>` from a restricted alphabet, retrying up to three times on a unique-constraint failure, and store the order with `status: 'pending'`, `paymentMethod: 'whatsapp'` and no `customer`. Verify that two rapid submissions produce two distinct order numbers, then delete the test documents through `/admin/orders`.

## 6. Checkout UI and WhatsApp hand-off

- [x] 6.1 Create `src/lib/whatsapp.ts` exporting `buildWhatsappUrl(number, message)` and `formatOrderMessage(order)`, building a `wa.me` URL with the message passed through `encodeURIComponent` and including the order number, one line per product with quantity and price, and the total. Verify `npm run typecheck` passes and a three-product order produces a message listing all three lines and the total.
- [x] 6.2 Make `/pago` a Server Component that keeps exporting `metadata` and delegates to a client checkout form, which renders the empty-cart state when the cart is empty and the form plus `cart-summary` otherwise. Verify both states render, and that the empty state offers a catalog link.
- [x] 6.3 Build the checkout form with name, phone, address, city, department and zip fields, marking the required ones, reporting the incomplete fields on submit while keeping entered values, and disabling the button while a submission is in flight. Verify that submitting with the phone and department blank reports exactly those two and creates no order, and that a double click cannot submit twice.
- [x] 6.4 Re-render the order summary on `/pago` from catalog prices so the customer confirms the amount that will actually be stored. Verify the summary matches the order created in group 5.
- [x] 6.5 On successful submission, clear the cart and navigate to `/confirmacion?orden=<orderNumber>`. Verify the cart is empty afterwards and no longer persists the completed items.
- [x] 6.6 Handle a failed submission by showing the error at the form, leaving the cart intact and not opening the hand-off. Verify by submitting an unknown product id and confirming the cart and entered values survive.
- [x] 6.7 Make `/confirmacion` display the order number and pending status from the `orden` query parameter, and state that there is no order to confirm when it is absent. Verify both by following a real checkout and by opening `/confirmacion` directly.
- [x] 6.8 Report that WhatsApp contact is unavailable when `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset, storing the order but opening no hand-off. Verify by unsetting the variable in `.env.local` and completing a checkout.
- [x] 6.9 On success, open the WhatsApp hand-off with the pre-filled summary addressed to the configured number. Verify in the browser that the message contains the order number, every line and the total.
- [x] 6.10 Replace the hardcoded `https://wa.me/573106198912` in `/contacto/page.tsx` with a link built by `buildWhatsappUrl` from the environment variable. Verify the contact page's WhatsApp link still resolves to the same number and that no hardcoded `wa.me` URL remains in `src/`.

## 7. Integration verification

- [x] 7.1 Run `npm run typecheck` and confirm it passes with no errors.
- [x] 7.2 Run `npm run build` and confirm it completes with the dev server stopped, confirming no prerender regression from the new client components.
- [x] 7.3 Walk the full journey in `npm run dev`: add from the grid, add a chosen quantity from a product page, reload and confirm persistence, edit in `/carrito`, complete `/pago`, then verify the order appears in `/admin/orders` with the WhatsApp payment method and pending status.
- [x] 7.4 Verify the responsive and accessibility checklist from `AGENTS.md` on the catalog grid, the drawer, `/carrito` and `/pago`: mobile layout, visible keyboard focus, AA contrast, `prefers-reduced-motion` respected, and no console or hydration warnings.