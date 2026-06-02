# Test Plan - SCRUM-101 E-commerce Checkout Process

## Application Overview

Comprehensive test plan for the SauceDemo E-commerce Checkout Process (SCRUM-101). Tests cover the complete checkout flow including cart review, information entry, order overview, and order completion. The test suite validates all acceptance criteria including item display, price calculations, field validation, error handling, and successful order placement.

## Test Scenarios

### 1. Cart Review Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. TP-001: Single Item Cart Display

**File:** `tests/cart-review/single-item-display.spec.ts`

**Steps:**
  1. Log in with valid credentials (Username: standard_user, Password: secret_sauce)
    - expect: User is logged in and on inventory page
  2. Add one product (Sauce Labs Backpack - $29.99) to cart
    - expect: Product is added to cart
    - expect: Cart badge shows '1'
  3. Click on shopping cart icon to view cart
    - expect: Cart page displays
    - expect: Cart contains 1 item: Sauce Labs Backpack with price $29.99
    - expect: Quantity shown as 1
    - expect: Remove button is visible
  4. Verify cart item details
    - expect: Product image displays correctly
    - expect: Product description is visible
    - expect: Price $29.99 is displayed
    - expect: Item name is clickable link

#### 1.2. TP-002: Multiple Items Cart Display

**File:** `tests/cart-review/multiple-items-display.spec.ts`

**Steps:**
  1. Log in with valid credentials
    - expect: User is logged in successfully
  2. Add 3 products to cart: Backpack ($29.99), Bike Light ($9.99), T-Shirt ($15.99)
    - expect: All three items are added to cart
    - expect: Cart badge shows '3'
  3. Navigate to cart page
    - expect: All 3 items display in cart
    - expect: Each item shows correct price
    - expect: Quantities displayed as 1 for each item
  4. Verify each item displays product name, description, and price
    - expect: Backpack: $29.99
    - expect: Bike Light: $9.99
    - expect: T-Shirt: $15.99
    - expect: All descriptions are accurate

#### 1.3. TP-003: Cart Subtotal Calculation

**File:** `tests/cart-review/subtotal-calculation.spec.ts`

**Steps:**
  1. Log in and add 4 items to cart: Backpack ($29.99), T-Shirt ($15.99), Onesie ($7.99), Fleece Jacket ($49.99)
    - expect: All items added successfully
  2. Navigate to cart page and verify total
    - expect: Cart displays all 4 items
    - expect: Subtotal calculation is correct: $103.96

#### 1.4. TP-004: Continue Shopping Button

**File:** `tests/cart-review/continue-shopping-button.spec.ts`

**Steps:**
  1. Log in and add items to cart, then navigate to cart page
    - expect: Cart page displays
  2. Click 'Continue Shopping' button
    - expect: User returns to inventory page
    - expect: Cart badge still shows item count
    - expect: Items remain in cart

#### 1.5. TP-005: Checkout Button Navigation

**File:** `tests/cart-review/checkout-button-navigation.spec.ts`

**Steps:**
  1. Log in, add items to cart, navigate to cart page
    - expect: Cart page displays with items
  2. Click 'Checkout' button
    - expect: User navigates to checkout information page (Step 1)
    - expect: Page URL shows checkout-step-one.html
    - expect: Form fields for First Name, Last Name, Zip Code are visible

#### 1.6. TP-006: Remove Item from Cart

**File:** `tests/cart-review/remove-item-from-cart.spec.ts`

**Steps:**
  1. Log in and add 3 items to cart: Backpack, T-Shirt, Onesie
    - expect: All items added, cart shows 3 items
  2. Navigate to cart page
    - expect: Cart displays 3 items
  3. Click 'Remove' button for T-Shirt
    - expect: T-Shirt is removed from cart
    - expect: Cart now shows 2 items
    - expect: Only Backpack and Onesie remain
    - expect: Cart badge updates to 2

### 2. Checkout Information Entry Tests

**Seed:** `tests/seed.spec.ts`

#### 2.1. TP-007: Valid Information Entry - Happy Path

**File:** `tests/checkout-info/valid-entry-happy-path.spec.ts`

**Steps:**
  1. Log in and add items to cart, navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter valid data: First Name: 'John', Last Name: 'Doe', Zip Code: '12345'
    - expect: All fields accept input
    - expect: Data is entered correctly in each field
  3. Click 'Continue' button
    - expect: Form validation passes
    - expect: User navigates to checkout overview page (Step 2)
    - expect: Page URL shows checkout-step-two.html

#### 2.2. TP-008: First Name Field - Empty Validation Error

**File:** `tests/checkout-info/first-name-empty-error.spec.ts`

**Steps:**
  1. Log in, add items to cart, navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Leave First Name empty, enter Last Name: 'Doe', Zip Code: '12345'
    - expect: Other fields accept input
  3. Click 'Continue' button
    - expect: Error message displays: 'Error: First Name is required'
    - expect: Error message appears as heading with error icon
    - expect: User remains on checkout information page

#### 2.3. TP-009: Last Name Field - Empty Validation Error

**File:** `tests/checkout-info/last-name-empty-error.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter First Name: 'John', leave Last Name empty, enter Zip Code: '12345'
    - expect: First Name and Zip Code accept input
  3. Click 'Continue' button
    - expect: Error message displays: 'Error: Last Name is required'
    - expect: User remains on checkout information page
    - expect: Previously entered data is retained

#### 2.4. TP-010: Zip Code Field - Empty Validation Error

**File:** `tests/checkout-info/zip-code-empty-error.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter First Name: 'John', Last Name: 'Doe', leave Zip Code empty
    - expect: Name fields accept input
  3. Click 'Continue' button
    - expect: Error message displays: 'Error: Postal Code is required'
    - expect: User remains on checkout information page

#### 2.5. TP-011: Special Characters in Name Fields

**File:** `tests/checkout-info/special-characters-names.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter special characters: First Name: 'Jean-Pierre', Last Name: 'O'Brien', Zip Code: '12345'
    - expect: Fields accept special characters like hyphens and apostrophes
  3. Click 'Continue' button
    - expect: Form accepts special characters
    - expect: User navigates to order overview page

#### 2.6. TP-012: Numeric Zip Code Boundary Values

**File:** `tests/checkout-info/zip-code-boundary-values.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Test with boundary zip codes - Test 1: Enter '00000'
    - expect: Zip code field accepts '00000'
  3. Click 'Continue' button
    - expect: Form validates and proceeds to order overview

#### 2.7. TP-013: Long String Input in Name Fields

**File:** `tests/checkout-info/long-string-input.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter very long string in First Name (50+ characters), normal Last Name, and Zip Code
    - expect: Field accepts long string input
  3. Click 'Continue' button
    - expect: Long string is accepted and processing continues

#### 2.8. TP-014: Data Persistence Across Pages

**File:** `tests/checkout-info/data-persistence.spec.ts`

**Steps:**
  1. Navigate to checkout information page and enter: First Name: 'Jane', Last Name: 'Smith', Zip Code: '54321'
    - expect: All data entered correctly
  2. Click 'Continue' button to go to order overview
    - expect: User navigates to order overview page
  3. Verify checkout information is displayed or accessible
    - expect: Entered information is retained in the system for use in order confirmation

#### 2.9. TP-015: Cancel Button Functionality

**File:** `tests/checkout-info/cancel-button-functionality.spec.ts`

**Steps:**
  1. Log in, add items to cart, navigate to checkout information page
    - expect: Checkout Step 1 page displays
  2. Enter some data: First Name: 'Test', Last Name: 'User'
    - expect: Data is entered
  3. Click 'Cancel' (Go back) button
    - expect: User returns to cart page
    - expect: Cart still contains the same items
    - expect: Entered checkout information is not saved

### 3. Order Overview Tests

**Seed:** `tests/seed.spec.ts`

#### 3.1. TP-016: Order Overview Display - Single Item

**File:** `tests/order-overview/single-item-overview.spec.ts`

**Steps:**
  1. Log in, add one item (Sauce Labs Backpack - $29.99) to cart, proceed through checkout information with valid data
    - expect: User reaches order overview page
  2. Verify order items display
    - expect: Order overview displays 1 item: Sauce Labs Backpack
    - expect: Quantity shown as 1
    - expect: Price displayed as $29.99

#### 3.2. TP-017: Order Overview Display - Multiple Items

**File:** `tests/order-overview/multiple-items-overview.spec.ts`

**Steps:**
  1. Log in, add 3 items to cart, proceed through checkout with valid data
    - expect: User reaches order overview page
  2. Verify all items display in order overview
    - expect: All 3 items display with correct quantities and prices
    - expect: Backpack: 1x $29.99
    - expect: T-Shirt: 1x $15.99
    - expect: Onesie: 1x $7.99

#### 3.3. TP-018: Pricing Breakdown - Subtotal Calculation

**File:** `tests/order-overview/subtotal-calculation.spec.ts`

**Steps:**
  1. Log in, add items totaling $45.98 (Backpack $29.99 + T-Shirt $15.99), proceed to order overview
    - expect: User reaches order overview page
  2. Verify subtotal calculation
    - expect: Item total displayed as $45.98

#### 3.4. TP-019: Pricing Breakdown - Tax Calculation

**File:** `tests/order-overview/tax-calculation.spec.ts`

**Steps:**
  1. Add items with subtotal $45.98 to cart, proceed to order overview
    - expect: User on order overview page
  2. Verify tax calculation
    - expect: Tax calculated as 8% of subtotal: $3.68
    - expect: Tax line displays 'Tax: $3.68'

#### 3.5. TP-020: Pricing Breakdown - Total Amount

**File:** `tests/order-overview/total-calculation.spec.ts`

**Steps:**
  1. Add items with subtotal $45.98, proceed to order overview
    - expect: Order overview displays
  2. Verify total calculation (Subtotal + Tax)
    - expect: Total = $45.98 + $3.68 = $49.66
    - expect: Total line displays 'Total: $49.66'

#### 3.6. TP-021: Payment Information Display

**File:** `tests/order-overview/payment-info-display.spec.ts`

**Steps:**
  1. Proceed through checkout to order overview page
    - expect: Order overview page displays
  2. Verify payment information section
    - expect: Payment Information section displays
    - expect: Payment method shown as 'SauceCard #31337'

#### 3.7. TP-022: Shipping Information Display

**File:** `tests/order-overview/shipping-info-display.spec.ts`

**Steps:**
  1. Proceed through checkout to order overview page
    - expect: Order overview page displays
  2. Verify shipping information section
    - expect: Shipping Information section displays
    - expect: Shipping method shown as 'Free Pony Express Delivery!'

#### 3.8. TP-023: Order Overview Layout and Elements

**File:** `tests/order-overview/layout-elements.spec.ts`

**Steps:**
  1. Reach order overview page after checkout information entry
    - expect: Order overview page displays correctly
  2. Verify page layout contains all sections
    - expect: Order summary section visible with items
    - expect: Payment information section present
    - expect: Shipping information section present
    - expect: Pricing breakdown section displayed
    - expect: Cancel and Finish buttons are visible

### 4. Order Completion Tests

**Seed:** `tests/seed.spec.ts`

#### 4.1. TP-024: Order Completion - Success Message

**File:** `tests/order-completion/success-message.spec.ts`

**Steps:**
  1. Complete full checkout flow: add items, enter information, review order, click Finish
    - expect: User navigates to order completion page
  2. Verify success message displays
    - expect: Heading 'Thank you for your order!' displays
    - expect: Success message 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' displays
    - expect: Pony Express image displays

#### 4.2. TP-025: Order Completion - Confirmation Page Elements

**File:** `tests/order-completion/confirmation-elements.spec.ts`

**Steps:**
  1. Complete full checkout process and reach order completion page
    - expect: Completion page displays
  2. Verify all completion page elements
    - expect: Page title shows 'Checkout: Complete!'
    - expect: Pony Express delivery graphic displays
    - expect: Success heading and message display
    - expect: Back Home button is visible and clickable

#### 4.3. TP-026: Back Home Button Functionality

**File:** `tests/order-completion/back-home-button.spec.ts`

**Steps:**
  1. Complete full checkout and reach order completion page
    - expect: Order completion page displays
  2. Click 'Back Home' button
    - expect: User returns to inventory/products page
    - expect: Cart badge is cleared or reset
    - expect: User can add new items to cart

#### 4.4. TP-027: Order Completion - URL Verification

**File:** `tests/order-completion/url-verification.spec.ts`

**Steps:**
  1. Complete checkout process
    - expect: User on order completion page
  2. Verify page URL
    - expect: Page URL is checkout-complete.html

### 5. Error Handling & Validation Tests

**Seed:** `tests/seed.spec.ts`

#### 5.1. TP-028: Validation Error - All Fields Empty

**File:** `tests/error-handling/all-fields-empty.spec.ts`

**Steps:**
  1. Navigate to checkout information page without entering any data
    - expect: Checkout form displays with empty fields
  2. Click 'Continue' button without entering any data
    - expect: Validation error displays: 'Error: First Name is required'
    - expect: Error message appears prominently with error icon
    - expect: User stays on checkout information page

#### 5.2. TP-029: Validation Error - Error Message Closure

**File:** `tests/error-handling/error-message-closure.spec.ts`

**Steps:**
  1. Trigger validation error by submitting empty form
    - expect: Error message 'Error: First Name is required' displays
  2. Click the X/close button on the error message
    - expect: Error message closes
    - expect: Form remains on page
    - expect: User can still submit the form

#### 5.3. TP-030: Validation - Multiple Field Errors Sequential

**File:** `tests/error-handling/sequential-field-errors.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Form displays
  2. Submit with empty First Name
    - expect: Error: 'First Name is required' displays
  3. Enter First Name, clear other fields, submit again
    - expect: Error: 'Last Name is required' displays
  4. Enter Last Name, clear Zip Code, submit again
    - expect: Error: 'Postal Code is required' displays

#### 5.4. TP-031: Form Validation - Whitespace Only Input

**File:** `tests/error-handling/whitespace-input.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Form displays
  2. Enter only spaces in First Name: '   ', Last Name: '   ', Zip Code: '   '
    - expect: Fields accept space characters
  3. Click 'Continue' button
    - expect: Form handles whitespace-only input appropriately (either accepts or shows validation error)

#### 5.5. TP-032: Form Validation - Alphanumeric Zip Code

**File:** `tests/error-handling/alphanumeric-zip.spec.ts`

**Steps:**
  1. Navigate to checkout information page
    - expect: Form displays
  2. Enter First Name: 'John', Last Name: 'Doe', Zip Code: 'ABC12'
    - expect: Zip code field accepts alphanumeric characters
  3. Click 'Continue' button
    - expect: Form processes alphanumeric zip codes

#### 5.6. TP-033: Error Handling - Invalid Checkout Link

**File:** `tests/error-handling/invalid-checkout-link.spec.ts`

**Steps:**
  1. Log in successfully
    - expect: User on inventory page
  2. Attempt to access checkout page without items in cart by navigating to checkout-step-one.html directly
    - expect: System handles empty cart scenario appropriately (redirects or shows appropriate message)

#### 5.7. TP-034: Navigation - Cancel and Continue Cycling

**File:** `tests/error-handling/navigation-cycling.spec.ts`

**Steps:**
  1. Proceed to checkout information page with items in cart
    - expect: Checkout page displays
  2. Click Cancel to return to cart
    - expect: User returns to cart page
  3. Click Checkout again to return to checkout information page
    - expect: Checkout form displays with empty fields
