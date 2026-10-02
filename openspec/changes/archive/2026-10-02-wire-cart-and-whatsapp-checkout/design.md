# Design

## Context

See `proposal.md` for motivation and `specs/` for requirements. The constraints that actually shape the approach:

- **`Orders.create` is admin-only** (`src/collections/Orders.ts:11`), so no customer can create an order today. This must be relaxed for anonymous clients.
- **`/api` is entirely owned by Payload.** `src/app/api/[[...slug]]/route.ts` is the REST/GraphQL catch-all. Next.js resolves static segments before catch-alls, so creating `src/app/api/orders/route.ts` would silently take `/api/orders` away from Payload and break the admin's order list.
- **`src/lib/payload.ts` is server-only.** `getPayloadApiUrl()` awaits `next/headers`, which throws outside a request scope, and there is no mutation helper - `payloadFetch` has been called read-only so far.
- **`CartContext` already owns the cart API but is memory-only.** `updateQuantity` clamps with `Math.max(0, ...)`, which permits a zero-quantity line instead of holding at one. There is no hydration flag, so a `localStorage` read would produce a server/client markup mismatch.
- **`/carrito` and `/pago` are prerendered Server Components** that export `metadata`, but the cart only exists in the browser.
- **The cart-drawer cluster is written but unreachable**, and `cart-drawer.tsx` reimplements the cart with hardcoded demo rows instead of reading context.
- **No email adapter** is configured in Payload, so order confirmation cannot rely on notifications.

## Goals / Non-Goals

**Goals:**

- One code path computes subtotal, shipping and total, shared by the client surfaces and the server-side validation.
- Order creation is validated server-side against catalog prices, so the browser is never trusted with money.
- No change to how Payload is mounted, and no new route that can shadow it.
- The change is reversible by reverting files; no data migration.

**Non-Goals:**

- Any payment gateway, card form, or online transaction. Payment is agreed over WhatsApp.
- Stock reservation or decrementing. The cart trusts the stock value seen at add time; reconciling oversell belongs to `catalog-data`.
- Customer accounts. `Orders.customer` stays unset; checkout is anonymous.
- Order editing or cancellation from the storefront.
- Email or admin notifications.

## Decisions

### Order creation goes through a Server Action, not a new HTTP route

A Server Action calls the existing `payloadFetch` helper with `method: 'POST'`.

**Why:** it is the only option that avoids the `/api` routing trap. Payload's catch-all claims every `/api/*` path, so a dedicated endpoint is only possible at a path outside `/api` (e.g. `/api-checkout/orders`), which is inconsistent and easy to get wrong later. A Server Action also keeps catalog-price lookups, validation and order-number generation server-side in one place, with no extra public surface.

**Alternatives considered:**

- *`src/app/api/orders/route.ts`* - rejected. Next.js gives static segments priority over catch-alls, so this silently replaces Payload's `/api/orders` and breaks the admin's order list. Non-obvious failure mode, easy to reintroduce.
- *Custom route outside `/api`* - works, but duplicates Payload's auth/validation path and adds a public URL that must be kept in sync.
- *Client POSTs straight to Payload's REST API* - rejected. It puts price validation in the browser, which the "catalog prices" requirement forbids.

`payloadFetch` already spreads `options` after `headers`, so `method` and `body` pass through and no helper rewrite is needed. One caveat to respect: a caller-supplied `headers` key would clobber the merged object, so the new helper must not pass `headers`.

### The catalog is the source of truth for prices

The Server Action receives line ids and quantities only, then reads each product from `Products` and rebuilds price, subtotal, shipping and total. Any id that does not resolve fails the whole submission.

**Why:** the browser holds a `price` in each cart line that a customer can edit in devtools. Storing it verbatim would let anyone place a 1-COP order. Re-deriving also means a price change between adding and checking out is charged at the current price, which is the behaviour a store owner expects.

**Trade-off:** one extra query per checkout. Acceptable at this volume, and `where[id][in]` keeps it to a single round trip.

### Totals live in one pure module

A new `src/lib/commerce.ts` exports `calculateShipping`, `calculateTotals`, `FREE_SHIPPING_THRESHOLD` and `SHIPPING_COST`, ported from the dead `cart-drawer.tsx` (free at or above 100.000 COP, otherwise 15.000 COP). `CartContext` derives `shipping` and `total` from it via `useMemo` and exposes them alongside the existing `totalItems`/`totalPrice`; the Server Action imports the same functions.

**Why:** the drawer, `/carrito`, `/pago` and the stored order must agree exactly. Four copies of the threshold is how a store ends up charging shipping on a free order.

### Hydration is gated explicitly

`CartContext` gains a `hydrated` flag, set after the first `localStorage` read. Surfaces that depend on stored state - the header badge, `/carrito` contents, `/pago` - render their final value only once `hydrated` is true.

**Why:** the storefront is prerendered, so the server renders an empty cart and the client's first paint would otherwise disagree, producing a hydration error and a flicker. `force-dynamic` is not needed, and would only hide the mismatch rather than fix it.

**Alternative considered:** read `localStorage` in a `useEffect` and render a neutral skeleton until then - equivalent, but a boolean is easier to assert against in specs.

### `updateQuantity` clamps to one, not zero

`Math.max(0, ...)` becomes `Math.max(1, ...)`, matching the already-written `quantity-selector` (which clamps at 1) and the "held at one" requirement. Removal stays an explicit control.

**Why:** a zero-quantity line renders as a priced row with no units, which is nonsense to a customer and inflates nothing but confuses everyone.

### `payloadMethod` gains a `whatsapp` option

`Orders.paymentMethod` adds `{ label: 'WhatsApp', value: 'whatsapp' }`, and checkout stores that value.

**Why:** the three existing options (contrarecibo, card, transfer) all describe a payment instrument, and none of them is what happens. Filing these orders under `contrarecibo` would misreport the channel in the admin's filters.

**Alternative considered:** reusing `contrarecibo`, since the money does change hands later by hand. Rejected as misleading.

### `Orders.create` opens to anonymous clients; nothing else does

`create` becomes `() => true`. `read`, `update` and `delete` keep their admin-only checks.

**Why:** checkout is anonymous by design, so the create path cannot require a user. Leaving read/update/delete closed means a leaked or spoofed order id cannot be used to inspect or alter anyone's order.

**Mitigations for the widened create path:** every price is re-derived from the catalog server-side; quantities are clamped to the product's `stock`; `orderNumber` is generated by the server, never accepted from the client; required address fields are validated as non-blank; and `customer` is never settable from this path.

**Residual risk:** anonymous clients can create any number of order documents, and the address/notes text fields have no `maxLength`, so a client could submit very large strings. Mitigation is Payload-side field limits or an edge rate limiter, which is outside this change; see Risks.

### The cart card avoids nesting interactive elements

`product-card.tsx` keeps its `div` root. The image and title sit inside a `Link` stretched over the card, while the cart button is a sibling raised with `relative z-10`, so clicking it never triggers navigation.

**Why:** wrapping the whole card in `Link` and nesting a `<button>` inside an `<a>` is invalid HTML and breaks keyboard and screen-reader behaviour. AGENTS.md also requires visible keyboard focus and AA contrast, which nested-interactive markup undermines.

**Alternative considered:** whole card as `Link` with `preventDefault` in the button handler. Rejected: the markup stays invalid, and `stopPropagation` is not a reliable fix for keyboard activation.

### The WhatsApp helper is shared and public-by-design

A new `src/lib/whatsapp.ts` builds the `wa.me` URL: `buildWhatsappUrl(number, message)` and `formatOrderMessage(order)`. It reads `NEXT_PUBLIC_WHATSAPP_NUMBER` and is imported by `/pago` and `/contacto`.

**Why:** the number is already published on `/contacto`, so a `NEXT_PUBLIC_` variable leaks nothing new and keeps the helper usable from both a Client Component and a Server Component without duplicating the URL shape or the message format.

`encodeURIComponent` is applied to the message, and the summary lists order number, one line per product with quantity and price, and the total.

### Order number is server-generated with retry

`NV-<yymmdd>-<4 chars>` from a restricted alphabet, retried up to three times on a unique-constraint failure.

**Why:** `orderNumber` is `unique`, and two customers submitting in the same second must not collide. Client-generated numbers would also let a client overwrite an existing order's number. Retrying is enough because collisions at 4 chars over the daily namespace are rare.

### Confirmation carries the order number in the URL

Checkout navigates to `/confirmacion?orden=<orderNumber>` after the order is stored.

**Why:** it survives a refresh, needs no server-side session, and satisfies the "no order to confirm" requirement trivially when the parameter is absent. The value is the customer's own order reference, not a credential.

**Alternative considered:** `sessionStorage`. Rejected - it breaks on refresh and on a shared device.

## Risks / Trade-offs

- **Anonymous order creation is a spam vector.** → Every created document is reviewed by an admin before acting on it; read/update/delete remain closed; later add Payload field limits or an edge rate limiter. Acceptable at launch volume.
- **Unbounded text in address and notes.** → The new `create` path accepts arbitrary strings. Add `maxLength` to the `shippingAddress` fields and `notes` in a follow-up if the admin panel shows noise.
- **Stock can oversell.** → Nothing decrements `Products.stock`; two customers can each buy the last unit. Mitigated only by the admin reconciling before preparing. Deliberately out of scope (see Non-Goals).
- **Prices change between add and checkout.** → The catalog price wins at checkout, which may differ from the price the customer saw in the cart. The order summary on `/pago` is re-rendered from catalog prices so the customer confirms the actual amount.
- **Cart prices drift from catalog for the same reason.** → Accepted. Reconciling per-line would require a read before every draw, and the cart is explicitly not the source of truth.
- **Hydration gate leaves a brief neutral state.** → Badge and totals paint one tick after mount. Preferred over a mismatch or a dynamic render.
- **`localStorage` is per-origin and per-browser.** → A cart does not follow the customer to another device, and clearing site data loses it. Acceptable for an anonymous cart.

## Migration Plan

1. Add `NEXT_PUBLIC_WHATSAPP_NUMBER=573106198912` to `.env.example` and to the local `.env.local`, seeded from the number currently hardcoded in `/contacto`.
2. Apply the `Orders` changes, then run `npx payload generate:types`. The import map is not affected: no custom admin components are introduced, only a new `paymentMethod` option.
3. Land the client-side work (commerce helpers, context, catalog, drawer, header, `/carrito`) before checkout; each step is independently shippable and leaves the storefront browsable.
4. Verify with `npm run typecheck`, then `npm run dev` and walk: add from grid, reload, edit in `/carrito`, submit, confirm the order appears in `/admin/orders`, then check the WhatsApp message.

**Rollback:** revert the files. `Orders.create` reverts to admin-only, which immediately disables checkout rather than leaving orders writable, so no data is stranded. `paymentMethod: 'whatsapp'` is left in place harmlessly on existing documents.

## Open Questions

- Whether free shipping should ever vary by city or department. Deferrable: it only changes a constant in `src/lib/commerce.ts`, not the specs or the approach.
- Whether admins should be notified of new orders. Payload has no email adapter yet; adding one would need a dependency decision and new requirements, so it is left out rather than half-planned.