// spec: specs/test-plan-scrum-101.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const TEST_USER = 'standard_user';
const TEST_PASSWORD = 'secret_sauce';

test.describe('Order Completion - AC4: Order Confirmation and Success', () => {
  // Helper function to complete full checkout flow
  async function completeFullCheckout(page, firstName = 'John', lastName = 'Doe', zipCode = '12345') {
    await page.goto(`${SAUCEDEMO_URL}/`, { waitUntil: 'load' });
    await page.locator('[data-test="username"]').fill(TEST_USER);
    await page.locator('[data-test="password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test="login-button"]').click();

    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });

    // Add item to cart
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.waitForTimeout(200);

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

    // Click Finish to complete order
    await page.locator('[data-test="finish"]').click();
    await page.locator('[data-test="checkout-complete-container"]').waitFor({ state: 'visible' });
  }

  test('TP-024: Order Completion - Success Message', async ({ page }) => {
    // 1. Complete full checkout flow
    await completeFullCheckout(page);

    // 2. Verify success message displays
    const successHeading = page.locator('[data-test="complete-header"]');
    await expect(successHeading).toBeVisible();
    await expect(successHeading).toContainText('Thank you for your order!');

    // Verify confirmation message
    const confirmMessage = page.locator('[data-test="complete-text"]');
    await expect(confirmMessage).toContainText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');

    // Verify pony image displays
    const ponyImage = page.locator('[data-test="pony-express"]');
    await expect(ponyImage).toBeVisible();

    console.log('✅ Order completion success message verified');
  });

  test('TP-025: Order Completion - Confirmation Page Elements', async ({ page }) => {
    // 1. Complete full checkout process
    await completeFullCheckout(page);

    // 2. Verify all completion page elements
    
    // Verify page title
    const pageTitle = page.locator('[data-test="page-title"]');
    await expect(pageTitle).toContainText('Checkout: Complete!');

    // Verify success heading
    const successHeading = page.locator('[data-test="complete-header"]');
    await expect(successHeading).toBeVisible();

    // Verify success message
    const successMessage = page.locator('[data-test="complete-text"]');
    await expect(successMessage).toBeVisible();

    // Verify pony graphic displays
    const ponyImage = page.locator('[data-test="pony-express"]');
    await expect(ponyImage).toBeVisible();

    // Verify Back Home button is visible
    const backHomeButton = page.locator('[data-test="back-to-products"]');
    await expect(backHomeButton).toBeVisible();

    console.log('✅ Order completion confirmation page elements verified');
  });

  test('TP-026: Back Home Button Functionality', async ({ page }) => {
    // 1. Complete full checkout and reach order completion page
    await completeFullCheckout(page);
    expect(await page.url()).toContain('checkout-complete.html');

    // 2. Click 'Back Home' button
    const backHomeButton = page.locator('[data-test="back-to-products"]');
    await backHomeButton.click();

    // Wait for inventory page to load
    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });

    // 3. Verify user returns to inventory/products page
    expect(await page.url()).toContain('inventory.html');

    // Verify products are displayed (not cart)
    const inventoryItems = page.locator('[data-test="inventory-item"]');
    const itemCount = await inventoryItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // 4. Verify cart badge is cleared/reset (no items in cart)
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    
    // Cart badge should be hidden after order completion
    const isBadgeVisible = await cartBadge.isVisible();
    if (isBadgeVisible) {
      // If badge is still visible, it should show 0
      await expect(cartBadge).toHaveText('0');
    }

    // 5. Verify user can add new items to cart
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.waitForTimeout(200);

    // Cart badge should now show 1
    const newBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(newBadge).toBeVisible();
    await expect(newBadge).toHaveText('1');

    console.log('✅ Back Home button functionality verified');
  });

  test('TP-027: Order Completion - URL Verification', async ({ page }) => {
    // 1. Complete checkout process
    await completeFullCheckout(page);

    // 2. Verify page URL
    const currentUrl = await page.url();
    expect(currentUrl).toContain('checkout-complete.html');

    // Additional URL verification - should be the final checkout page
    const urlParts = currentUrl.split('/');
    const pageName = urlParts[urlParts.length - 1];
    expect(pageName).toBe('checkout-complete.html');

    console.log('✅ Order completion URL verification passed');
  });
});
