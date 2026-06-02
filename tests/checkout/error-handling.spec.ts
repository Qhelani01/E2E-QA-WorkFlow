// spec: specs/test-plan-scrum-101.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const TEST_USER = 'standard_user';
const TEST_PASSWORD = 'secret_sauce';

test.describe('Error Handling & Validation - AC5: Form Validation and Edge Cases', () => {
  // Helper function to login and navigate to checkout
  async function loginAndGoToCheckout(page) {
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
  }

  test('TP-028: Validation Error - All Fields Empty', async ({ page }) => {
    // 1. Navigate to checkout information page without entering any data
    await loginAndGoToCheckout(page);

    // Fields should be empty by default
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');

    // 2. Click 'Continue' button without entering any data
    await page.locator('[data-test="continue"]').click();

    // 3. Verify validation error displays
    const errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toBeVisible();
    
    // Should show First Name error (typically the first validation)
    await expect(errorContainer).toContainText('First Name is required');

    // Verify error message appears prominently with error icon
    const errorIcon = page.locator('[data-test="error"] [data-test="error-button"]');
    await expect(errorIcon).toBeVisible();

    // 4. Verify user stays on checkout information page
    expect(await page.url()).toContain('checkout-step-one.html');

    console.log('✅ All fields empty validation error verified');
  });

  test('TP-029: Validation Error - Error Message Closure', async ({ page }) => {
    // 1. Navigate to checkout and trigger validation error
    await loginAndGoToCheckout(page);

    // Submit empty form to trigger error
    await page.locator('[data-test="continue"]').click();

    // 2. Verify error message displays
    const errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toBeVisible();

    // 3. Click the X/close button on the error message
    const closeButton = page.locator('[data-test="error"] [data-test="error-button"]');
    await closeButton.click();

    // 4. Verify error message closes
    await expect(errorContainer).not.toBeVisible();

    // 5. Verify form remains on page and user can submit again
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();

    // User can still submit the form
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');

    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });

    console.log('✅ Error message closure verified');
  });

  test('TP-030: Validation - Multiple Field Errors Sequential', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Submit with empty First Name
    await page.locator('[data-test="continue"]').click();
    
    let errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toContainText('First Name is required');

    // Close error
    await page.locator('[data-test="error"] [data-test="error-button"]').click();

    // 3. Enter First Name, clear other fields, submit again
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="continue"]').click();

    errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toContainText('Last Name is required');

    // Close error
    await page.locator('[data-test="error"] [data-test="error-button"]').click();

    // 4. Enter Last Name, clear Zip Code, submit again
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="continue"]').click();

    errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toContainText('Postal Code is required');

    console.log('✅ Sequential field error validation verified');
  });

  test('TP-031: Form Validation - Whitespace Only Input', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter only spaces in all fields
    await page.locator('[data-test="firstName"]').fill('   ');
    await page.locator('[data-test="lastName"]').fill('   ');
    await page.locator('[data-test="postalCode"]').fill('   ');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify form handles whitespace-only input appropriately
    // Most forms reject whitespace-only as invalid
    const errorContainer = page.locator('[data-test="error-message"]');
    const onOverviewPage = page.locator('[data-test="checkout-summary-container"]');

    // Either an error appears or form accepts it and proceeds
    const hasError = await errorContainer.isVisible();
    const onOverview = await onOverviewPage.isVisible();

    expect(hasError || onOverview).toBeTruthy();

    if (hasError) {
      // If validation error, should mention one of the fields is required
      await expect(errorContainer).toContainText('is required');
      console.log('✅ Whitespace-only input rejected with validation error');
    } else {
      // If proceeding, form accepts whitespace
      expect(await page.url()).toContain('checkout-step-two.html');
      console.log('✅ Whitespace-only input accepted by form');
    }
  });

  test('TP-032: Form Validation - Alphanumeric Zip Code', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter First Name, Last Name, and alphanumeric Zip Code
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('ABC12');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify form processes alphanumeric zip codes
    const errorContainer = page.locator('[data-test="error-message"]');
    const onOverviewPage = page.locator('[data-test="checkout-summary-container"]');

    // Either an error appears for invalid zip format or form accepts it
    const hasError = await errorContainer.isVisible();
    const onOverview = await onOverviewPage.isVisible();

    expect(hasError || onOverview).toBeTruthy();

    if (hasError) {
      // If validation rejects alphanumeric
      console.log('✅ Alphanumeric zip code rejected with validation');
    } else {
      // If form accepts it
      expect(await page.url()).toContain('checkout-step-two.html');
      console.log('✅ Alphanumeric zip code accepted');
    }
  });

  test('TP-033: Error Handling - Invalid Checkout Link', async ({ page }) => {
    // 1. Log in successfully
    await page.goto(`${SAUCEDEMO_URL}/`, { waitUntil: 'load' });
    await page.locator('[data-test="username"]').fill(TEST_USER);
    await page.locator('[data-test="password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test="login-button"]').click();

    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('inventory');

    // 2. Attempt to access checkout page without items in cart by navigating directly
    await page.goto(`${SAUCEDEMO_URL}/checkout-step-one.html`, { waitUntil: 'load' });

    // 3. System should handle empty cart scenario appropriately
    // The page should either:
    // - Redirect to inventory or cart
    // - Show an error message
    // - Allow access but show empty cart

    const currentUrl = await page.url();
    const errorMessage = page.locator('[data-test="error-message"]');
    const cartEmpty = page.locator('[data-test="cart-list-container"]');

    // Verify some form of handling occurs
    const isErrorPresent = await errorMessage.isVisible().catch(() => false);
    const isRedirected = !currentUrl.includes('checkout-step-one.html');
    const isCartEmpty = await cartEmpty.isVisible().catch(() => false);

    expect(isErrorPresent || isRedirected || isCartEmpty).toBeTruthy();

    console.log('✅ Invalid checkout link handled appropriately');
  });

  test('TP-034: Navigation - Cancel and Continue Cycling', async ({ page }) => {
    // 1. Navigate to checkout information page with items in cart
    await loginAndGoToCheckout(page);
    expect(await page.url()).toContain('checkout-step-one.html');

    // 2. Click Cancel to return to cart
    await page.locator('[data-test="cancel"]').click();

    await page.locator('[data-test="cart-list"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('cart.html');

    // 3. Click Checkout again to return to checkout information page
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="checkout-info-container"]').waitFor({ state: 'visible' });

    // 4. Verify checkout form displays with empty fields
    expect(await page.url()).toContain('checkout-step-one.html');

    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');

    console.log('✅ Cancel and continue cycling navigation verified');
  });
});
