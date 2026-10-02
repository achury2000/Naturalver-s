# whatsapp-checkout Specification

## Purpose

Lets a customer complete a purchase without an online payment gateway: they submit their delivery details, the order is persisted so staff can see it in the admin, and WhatsApp opens with the summary so the business can confirm payment and delivery by hand.

## Requirements

### Requirement: Checkout requires a cart
The system SHALL only present the checkout form when the cart holds at least one line, and SHALL explain that the cart is empty otherwise.

#### Scenario: Customer reaches checkout with items
- **WHEN** a customer with items in the cart opens `/pago`
- **THEN** the system presents the checkout form alongside a summary of the order

#### Scenario: Customer reaches checkout with an empty cart
- **WHEN** a customer with an empty cart opens `/pago`
- **THEN** the system states the cart is empty and offers a link to the catalog, and does not present the form

### Requirement: Delivery details are required before submitting
The system SHALL require the customer's name, phone, address, city and department, each with a non-blank trimmed value, and SHALL identify the fields that are missing before allowing submission.

#### Scenario: Customer submits with blank required fields
- **WHEN** a customer submits the checkout form leaving the phone and department blank
- **THEN** no order is created and the system reports those two fields as incomplete, leaving the entered values in place

#### Scenario: Value is only whitespace
- **WHEN** a required field contains only spaces
- **THEN** the system treats it as incomplete

#### Scenario: Customer provides every required field
- **WHEN** a customer provides non-blank values for all required fields
- **THEN** the system accepts the submission and creates the order

### Requirement: Submitted order prices come from the catalog
The system SHALL derive the price of every ordered product from the catalog when the order is stored, and SHALL NOT accept the prices submitted by the browser.

#### Scenario: Client submits an inflated price
- **WHEN** an order is submitted declaring a unit price higher than the catalog's price for that product
- **THEN** the stored order records the catalog price and the totals reflect the catalog price

#### Scenario: Client submits an unknown product
- **WHEN** an order is submitted naming a product that does not exist in the catalog
- **THEN** no order is created and the system reports that one or more products are unavailable

### Requirement: Creating an order from the storefront
The system SHALL store the submitted order as a document with a unique order number, a status of pending, the WhatsApp payment method, the ordered lines, and the subtotal, shipping and total as computed from catalog prices.

#### Scenario: Successful checkout
- **WHEN** a customer completes the checkout form successfully
- **THEN** the system stores one order whose number is unique, whose status is pending and whose payment method is WhatsApp, and reports that number to the customer

#### Scenario: Two customers check out at once
- **WHEN** two customers submit orders concurrently
- **THEN** both orders are stored with distinct order numbers

### Requirement: Order numbers are unique
The system SHALL reject an order whose order number is already taken rather than storing a duplicate.

#### Scenario: Duplicate order number is submitted
- **WHEN** an order is submitted with an order number that already exists
- **THEN** the system does not store a second order with that number and reports a failure to the customer

### Requirement: Storefront customers can create orders only
The system SHALL allow an unauthenticated storefront visitor to create an order, and SHALL continue to refuse order reads, updates and deletes to anyone who is not an administrator.

#### Scenario: Anonymous customer submits an order
- **WHEN** a customer who has never signed in submits the checkout form
- **THEN** the order is created successfully

#### Scenario: Anonymous customer tries to read orders
- **WHEN** an unauthenticated client requests the order list
- **THEN** the request is refused

#### Scenario: Anonymous customer tries to modify an order
- **WHEN** an unauthenticated client attempts to change or delete an existing order
- **THEN** the request is refused

### Requirement: A configured WhatsApp number
The system SHALL take the business's WhatsApp number from server configuration and SHALL NOT hardcode it in any page.

#### Scenario: Number is configured
- **WHEN** the WhatsApp number is set in the server environment
- **THEN** the checkout hand-off targets that number

#### Scenario: Number is missing
- **WHEN** the WhatsApp number is not set
- **THEN** the system stores the order but reports that WhatsApp contact is unavailable and does not send the customer to an unknown or empty destination

### Requirement: WhatsApp hand-off carries the order summary
The system SHALL open a WhatsApp conversation addressed to the configured number with the order number, each ordered line and the total already written, so the customer only has to send.

#### Scenario: Hand-off message content
- **WHEN** the hand-off occurs
- **THEN** the pre-filled message contains the order number, every ordered line with its quantity and price, and the total

#### Scenario: Message with multiple lines
- **WHEN** the order contains three distinct products
- **THEN** the pre-filled message lists all three lines

### Requirement: Cart is cleared only after the order is stored
The system SHALL keep the customer's cart intact until the order has been stored successfully, and SHALL clear it as part of completing the checkout.

#### Scenario: Order is stored
- **WHEN** an order is stored successfully
- **THEN** the cart becomes empty and no longer persists the completed items

#### Scenario: Storing the order fails
- **WHEN** the order cannot be stored
- **THEN** the cart is left exactly as it was and the customer can resubmit without re-entering their details

### Requirement: Checkout failure is reported
The system SHALL tell the customer that the order could not be completed when creation fails, and SHALL NOT open the WhatsApp hand-off.

#### Scenario: Creation fails
- **WHEN** the order cannot be stored
- **THEN** the system shows an error at the checkout form, keeps the cart, and does not open WhatsApp

#### Scenario: Submission is in progress
- **WHEN** an order submission is being processed
- **THEN** the system prevents a second submission of the same order

### Requirement: Confirmation identifies the order
The system SHALL show the customer the created order's number and pending status on the confirmation screen, so they can quote it.

#### Scenario: Confirmation after a successful order
- **WHEN** a customer reaches the confirmation screen after their order was stored
- **THEN** the system displays that order's number and its pending status

#### Scenario: Confirmation opened directly without an order
- **WHEN** the confirmation screen is opened without a stored order to show
- **THEN** the system states that there is no order to confirm rather than inventing one
