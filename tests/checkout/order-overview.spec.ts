// spec: specs/test-plan-scrum-101.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const TEST_USER = 'standard_user';
const TEST_PASSWORD = 'secret_sauce';

// Product prices for calculation verification
const PRODUCT_PRICES = {
  backpack: 29.99,
  bikeLight: 9.99,
  tShirt: 15.99,
  onesie: 7.99,
  jacket: 49.99,
};

// Helper to calculate tax (8% rate)
function calculateTax(subtotal: number): number {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

test.describe('Order Overview - AC3: Order Summary and Pricing', () => {
  // Helper function to complete checkout through overview page
  async function completeCheckoutToOverview(page, productNames: string[], firstName = 'John', lastName = 'Doe', zipCode = '12345') {
    await page.goto(`${SAUCEDEMO_URL}/`, { waitUntil: 'load' });
    await page.locator('[data-test="username"]').fill(TEST_USER);
    await page.locator('[data-test="password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test="login-button"]').click();

    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });

    // Add products to cart
    for (const productName of productNames) {
      const addButton = page.locator(`button[data-test="add-to-cart-${productName}"]`);
      await addButton.click();
      await page.waitForTimeout(200);
    }

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="cart-list"]').waitFor({ state: 'visible' });

    // Go to checkout
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="checkout-info-container"]').waitFor({ state: 'visible' });

    // Fill in checkout info
    await page.locator('[data-test="firstName"]').fill(firstName);
    await page.locator('[data-test="lastName"]').fill(lastName);
    await page.locator('[data-test="postalCode"]').fill(zipCode);

    // Continue to overview
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });
  }

  test('TP-016: Order Overview Display - Single Item', async ({ page }) => {
    // 1. Add one item and proceed through checkout
    await completeCheckoutToOverview(page, ['sauce-labs-backpack']);

    // 2. Verify order overview displays
    expect(await page.url()).toContain('checkout-step-two.html');

    // 3. Verify order items display
    const cartItems = page.locator('[data-test="cart-list-container"] .cart-item');
    await expect(cartItems).toHaveCount(1);

    // Verify item details
    await expect(page).toContainText('Sauce Labs Backpack');
    await expect(page).toContainText('$29.99');

    const quantity = page.locator('.cart_quantity');
    await expect(quantity).toContainText('1');

    console.log('✅ Single item order overview display verified');
  });

  test('TP-017: Order Overview Display - Multiple Items', async ({ page }) => {
    // 1. Add 3 items and proceed through checkout
    await completeCheckoutToOverview(page, [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-onesie'
    ]);

    // 2. Verify all items display
    const cartItems = page.locator('[data-test="cart-list-container"] .cart-item');
    await expect(cartItems).toHaveCount(3);

    // 3. Verify each item with correct prices
    await expect(page).toContainText('Sauce Labs Backpack');
    await expect(page).toContainText('Sauce Labs Bolt T-Shirt');
    await expect(page).toContainText('Sauce Labs Onesie');

    await expect(page).toContainText('$29.99'); // Backpack
    await expect(page).toContainText('$15.99'); // T-Shirt
    await expect(page).toContainText('$7.99');  // Onesie

    console.log('✅ Multiple items order overview display verified');
  });

  test('TP-018: Pricing Breakdown - Subtotal Calculation', async ({ page }) => {
    // 1. Add 2 items totaling $45.98 (Backpack $29.99 + T-Shirt $15.99)
    await completeCheckoutToOverview(page, [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt'
    ]);

    // 2. Verify subtotal calculation
    const expectedSubtotal = PRODUCT_PRICES.backpack + PRODUCT_PRICES.tShirt;
    expect(expectedSubtotal).toBe(45.98);

    // Verify subtotal is displayed
    const itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    await expect(itemTotalLabel).toContainText(`$${expectedSubtotal.toFixed(2)}`);

    console.log(`✅ Subtotal calculation verified: $${expectedSubtotal.toFixed(2)}`);
  });

  test('TP-019: Pricing Breakdown - Tax Calculation', async ({ page }) => {
    // 1. Add items with subtotal $45.98
    await completeCheckoutToOverview(page, [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt'
    ]);

    // 2. Verify tax calculation (8% of $45.98 = $3.68)
    const subtotal = 45.98;
    const expectedTax = calculateTax(subtotal);
    expect(expectedTax).toBe(3.68);

    // Verify tax is displayed
    const taxLabel = page.locator('[data-test="tax-label"]');
    await expect(taxLabel).toContainText(`$${expectedTax.toFixed(2)}`);

    console.log(`✅ Tax calculation verified: $${expectedTax.toFixed(2)} (8% of $${subtotal})`);
  });

  test('TP-020: Pricing Breakdown - Total Amount', async ({ page }) => {
    // 1. Add items with subtotal $45.98
    await completeCheckoutToOverview(page, [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt'
    ]);

    // 2. Verify total calculation
    const subtotal = 45.98;
    const tax = calculateTax(subtotal);
    const expectedTotal = subtotal + tax;
    expect(expectedTotal).toBe(49.66);

    // Verify total is displayed
    const totalLabel = page.locator('[data-test="total-label"]');
    await expect(totalLabel).toContainText(`$${expectedTotal.toFixed(2)}`);

    // Verify pricing breakdown section
    const pricingSummary = page.locator('[data-test="checkout-summary-total"]');
    await expect(pricingSummary).toBeVisible();

    console.log(`✅ Total calculation verified: $${expectedTotal.toFixed(2)} ($${subtotal} + $${tax})`);
  });

  test('TP-021: Payment Information Display', async ({ page }) => {
    // 1. Proceed through checkout to order overview
    await completeCheckoutToOverview(page, ['sauce-labs-backpack']);

    // 2. Verify payment information section displays
    const paymentLabel = page.locator('[data-test="payment-info-label"]');
    await expect(paymentLabel).toBeVisible();

    // Verify payment method is displayed
    const paymentMethod = page.locator('[data-test="payment-info-value"]');
    await expect(paymentMethod).toContainText('SauceCard #31337');

    console.log('✅ Payment information display verified');
  });

  test('TP-022: Shipping Information Display', async ({ page }) => {
    // 1. Proceed through checkout to order overview
    await completeCheckoutToOverview(page, ['sauce-labs-backpack']);

    // 2. Verify shipping information section displays
    const shippingLabel = page.locator('[data-test="shipping-info-label"]');
    await expect(shippingLabel).toBeVisible();

    // Verify shipping method is displayed
    const shippingMethod = page.locator('[data-test="shipping-info-value"]');
    await expect(shippingMethod).toContainText('Free Pony Express Delivery!');

    console.log('✅ Shipping information display verified');
  });

  test('TP-023: Order Overview Layout and Elements', async ({ page }) => {
    // 1. Navigate to order overview page
    await completeCheckoutToOverview(page, [
      'sauce-labs-backpack',
      'sauce-labs-bike-light'
    ]);

    // 2. Verify all layout sections are present
    
    // Verify order summary section
    const orderSummary = page.locator('[data-test="cart-list-container"]');
    await expect(orderSummary).toBeVisible();

    // Verify payment information section
    const paymentSection = page.locator('[data-test="payment-info-label"]');
    await expect(paymentSection).toBeVisible();

    // Verify shipping information section
    const shippingSection = page.locator('[data-test="shipping-info-label"]');
    await expect(shippingSection).toBeVisible();

    // Verify pricing breakdown section
    const pricingSection = page.locator('[data-test="checkout-summary-total"]');
    await expect(pricingSection).toBeVisible();

    // Verify Cancel and Finish buttons
    const cancelButton = page.locator('[data-test="cancel"]');
    await expect(cancelButton).toBeVisible();

    const finishButton = page.locator('[data-test="finish"]');
    await expect(finishButton).toBeVisible();

    console.log('✅ Order overview layout and elements verified');
  });
});
