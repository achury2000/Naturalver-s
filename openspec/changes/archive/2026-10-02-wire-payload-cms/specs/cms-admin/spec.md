# Spec Delta

## Purpose

Payload CMS boots and serves a reachable admin panel with proper access control. This capability covers REST API exposure, type-safe generated types, configuration consistency (no localization without i18n), and privileged collection protection.

## ADDED Requirements

### Requirement: Payload is reachable at `/api` and `/admin`

The Payload CMS SHALL be mounted and accessible so that the admin panel and REST API respond to requests.

#### Scenario: The REST API and admin respond
- **WHEN** a GET request is made to `/api/products`
- **THEN** the request returns a 200 with a valid Payload response shape (`{ docs, totalDocs, totalPages, page }`)
- **WHEN** a browser navigates to `/admin`
- **THEN** the Payload admin panel loads and presents the login screen

#### Scenario: The admin is not a client-only route
- **WHEN** the admin panel is accessed
- **THEN** it is served by the Payload server, not a Next.js client bundle
- **AND** no `use client` directive is required for the admin to function

### Requirement: Collections type-check against the installed packages

All collection definitions SHALL import types from the installed `payload` package (not a non-existent wrapper).

#### Scenario: Imports resolve
- **WHEN** TypeScript compiles the collection files
- **THEN** `import { CollectionConfig } from 'payload'` resolves without error
- **AND** no `Cannot find module '@payloadcms/payload'` errors remain

#### Scenario: The type output path is the supported key
- **WHEN** `payload.config.ts` is read
- **THEN** the `typescript` block uses `outputFile` (not `outfile`)
- **AND** the generated types write to `src/types/payload.ts`

### Requirement: No localized field without i18n configuration

The CMS configuration SHALL be internally consistent: the site is served in a single language, so field localization SHALL not be declared without a corresponding i18n configuration that resolves values to plain strings.

#### Scenario: The config declares no localized fields OR declares a full i18n block
- **WHEN** Payload starts
- **THEN** it boots without throwing "localized fields require i18n configuration"
- **AND** no collection field has `localized: true` unless an `i18n` block with `supportedLanguages` and `defaultLanguage` exists

#### Scenario: Localized values are not returned as locale objects
- **WHEN** a query requests a field that was previously localized
- **THEN** the response contains a plain string (e.g., `"Espirulina"`) rather than `{ es: "Espirulina" }`
- **AND** the storefront `<h3>` elements render the string directly, not `[object Object]`

### Requirement: Privileged collections are access-controlled

The `Orders` collection SHALL deny unauthenticated access and restrict mutations to authenticated admin users.

#### Scenario: Unauthenticated read of orders is denied
- **WHEN** an unauthenticated request reads `/api/orders`
- **THEN** the response is 401 or 403
- **AND** no order data is returned

#### Scenario: Create/update/delete require authentication or explicit permission
- **WHEN** an unauthenticated request attempts to create, update, or delete an order
- **THEN** the response is 401 or 403

#### Scenario: Admin requires an authenticated user with the admin role
- **WHEN** a browser accesses `/admin`
- **THEN** the login screen requires valid credentials
- **AND** only users in the `users` collection with the admin role can proceed