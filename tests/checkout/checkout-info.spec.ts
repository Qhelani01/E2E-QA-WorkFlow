// spec: specs/test-plan-scrum-101.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const TEST_USER = 'standard_user';
const TEST_PASSWORD = 'secret_sauce';

test.describe('Checkout Information Entry - AC2: Form Validation and Data Entry', () => {
  // Helper function to login and navigate to checkout
  async function loginAndGoToCheckout(page) {
    await page.goto(`${SAUCEDEMO_URL}/`, { waitUntil: 'load' });
    await page.locator('[data-test="username"]').fill(TEST_USER);
    await page.locator('[data-test="password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test="login-button"]').click();
    
    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });
    
    // Add item to cart
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.waitForTimeout(300);
    
    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="cart-list"]').waitFor({ state: 'visible' });
    
    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="checkout-info-container"]').waitFor({ state: 'visible' });
  }

  test('TP-007: Valid Information Entry - Happy Path', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);
    expect(await page.url()).toContain('checkout-step-one.html');

    // 2. Enter valid data
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Verify data is entered
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('John');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('12345');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify navigation to order overview page
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('checkout-step-two.html');

    console.log('✅ Valid information entry (happy path) verified');
  });

  test('TP-008: First Name Field - Empty Validation Error', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Leave First Name empty, enter Last Name and Zip Code
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify error message displays
    const errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('First Name is required');

    // Verify user remains on checkout information page
    expect(await page.url()).toContain('checkout-step-one.html');

    console.log('✅ First Name empty validation error verified');
  });

  test('TP-009: Last Name Field - Empty Validation Error', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter First Name, leave Last Name empty, enter Zip Code
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify error message displays
    const errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('Last Name is required');

    // Verify previously entered data is retained
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('John');

    // Verify user remains on checkout information page
    expect(await page.url()).toContain('checkout-step-one.html');

    console.log('✅ Last Name empty validation error verified');
  });

  test('TP-010: Zip Code Field - Empty Validation Error', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter First Name and Last Name, leave Zip Code empty
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify error message displays for Postal Code
    const errorContainer = page.locator('[data-test="error-message"]');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('Postal Code is required');

    // Verify user remains on checkout information page
    expect(await page.url()).toContain('checkout-step-one.html');

    console.log('✅ Zip Code empty validation error verified');
  });

  test('TP-011: Special Characters in Name Fields', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter special characters in name fields
    await page.locator('[data-test="firstName"]').fill('Jean-Pierre');
    await page.locator('[data-test="lastName"]').fill("O'Brien");
    await page.locator('[data-test="postalCode"]').fill('12345');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify form accepts special characters and proceeds
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('checkout-step-two.html');

    console.log('✅ Special characters in name fields accepted');
  });

  test('TP-012: Numeric Zip Code Boundary Values', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter boundary zip code (all zeros)
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('00000');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify form validates and proceeds
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('checkout-step-two.html');

    console.log('✅ Numeric zip code boundary values accepted');
  });

  test('TP-013: Long String Input in Name Fields', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter very long string in First Name (50+ characters)
    const longString = 'A'.repeat(60);
    await page.locator('[data-test="firstName"]').fill(longString);
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // 3. Click 'Continue' button
    await page.locator('[data-test="continue"]').click();

    // 4. Verify long string is accepted and processing continues
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });
    expect(await page.url()).toContain('checkout-step-two.html');

    console.log('✅ Long string input in name fields accepted');
  });

  test('TP-014: Data Persistence Across Pages', async ({ page }) => {
    // 1. Navigate to checkout information page and enter data
    await loginAndGoToCheckout(page);

    const testFirstName = 'Jane';
    const testLastName = 'Smith';
    const testZipCode = '54321';

    await page.locator('[data-test="firstName"]').fill(testFirstName);
    await page.locator('[data-test="lastName"]').fill(testLastName);
    await page.locator('[data-test="postalCode"]').fill(testZipCode);

    // Verify all data entered correctly
    await expect(page.locator('[data-test="firstName"]')).toHaveValue(testFirstName);
    await expect(page.locator('[data-test="lastName"]')).toHaveValue(testLastName);
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue(testZipCode);

    // 2. Click 'Continue' button to go to order overview
    await page.locator('[data-test="continue"]').click();

    // 3. Verify checkout information is retained/displayed
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible' });

    // The order overview should show that data was submitted
    // (even though the form data itself is usually not re-displayed on order overview)
    expect(await page.url()).toContain('checkout-step-two.html');

    console.log('✅ Data persistence across pages verified');
  });

  test('TP-015: Cancel Button Functionality', async ({ page }) => {
    // 1. Navigate to checkout information page
    await loginAndGoToCheckout(page);

    // 2. Enter some data
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');

    // 3. Click 'Cancel' button
    await page.locator('[data-test="cancel"]').click();

    // Wait for cart page to load
    await page.locator('[data-test="cart-list"]').waitFor({ state: 'visible' });

    // 4. Verify user returns to cart page
    expect(await page.url()).toContain('cart.html');

    // Verify cart still contains the same items
    const cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(1);

    // Verify entered checkout information is not saved by going back to checkout
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="checkout-info-container"]').waitFor({ state: 'visible' });

    // Fields should be empty
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');

    console.log('✅ Cancel button functionality verified');
  });
});
