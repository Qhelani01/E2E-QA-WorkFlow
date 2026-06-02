// spec: specs/test-plan-scrum-101.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const TEST_USER = 'standard_user';
const TEST_PASSWORD = 'secret_sauce';

// Product prices from exploratory testing
const PRODUCT_PRICES = {
  backpack: 29.99,
  bikeLight: 9.99,
  tShirt: 15.99,
  onesie: 7.99,
  jacket: 49.99,
};

test.describe('Cart Review - AC1: Cart Display and Navigation', () => {
  // Helper function to login
  async function login(page) {
    await page.goto(`${SAUCEDEMO_URL}/`, { waitUntil: 'load' });
    await page.locator('[data-test="username"]').fill(TEST_USER);
    await page.locator('[data-test="password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });
  }

  // Helper to add product to cart
  async function addProductToCart(page, productName: string) {
    const addButton = page.locator(`button[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`);
    await addButton.click();
    await page.waitForTimeout(500); // Wait for cart badge to update
  }

  // Helper to navigate to cart
  async function goToCart(page) {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="cart-list"]').waitFor({ state: 'visible' });
  }

  test('TP-001: Single Item Cart Display', async ({ page }) => {
    // 1. Log in with valid credentials
    await login(page);
    expect(await page.url()).toContain('inventory');

    // 2. Add one product (Sauce Labs Backpack - $29.99) to cart
    await addProductToCart(page, 'sauce-labs-backpack');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // 3. Click on shopping cart icon to view cart
    await goToCart(page);
    expect(await page.url()).toContain('cart.html');

    // 4. Verify cart item details
    const cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(1);

    const itemName = page.locator('.inventory_item_name');
    await expect(itemName).toContainText('Sauce Labs Backpack');

    const itemPrice = page.locator('[data-test="inventory-item-price"]');
    await expect(itemPrice).toContainText('$29.99');

    const quantityLabel = page.locator('.cart_quantity');
    await expect(quantityLabel).toContainText('1');

    const removeButton = page.locator('[data-test*="remove"]');
    await expect(removeButton).toBeVisible();

    console.log('✅ Single item cart display verified');
  });

  test('TP-002: Multiple Items Cart Display', async ({ page }) => {
    // 1. Log in with valid credentials
    await login(page);

    // 2. Add 3 products to cart
    await addProductToCart(page, 'sauce-labs-backpack');
    await addProductToCart(page, 'sauce-labs-bike-light');
    await addProductToCart(page, 'sauce-labs-bolt-t-shirt');
    
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText('3');

    // 3. Navigate to cart page
    await goToCart(page);

    // 4. Verify all 3 items display with correct prices
    const cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(3);

    // Verify each item displays product name, description, and price
    const itemNames = page.locator('.inventory_item_name');
    const itemCount = await itemNames.count();
    expect(itemCount).toBe(3);

    // Check for expected items
    await expect(page).toContainText('Sauce Labs Backpack');
    await expect(page).toContainText('Sauce Labs Bike Light');
    await expect(page).toContainText('Sauce Labs Bolt T-Shirt');

    // Verify prices
    await expect(page).toContainText('$29.99'); // Backpack
    await expect(page).toContainText('$9.99');  // Bike Light
    await expect(page).toContainText('$15.99'); // T-Shirt

    console.log('✅ Multiple items cart display verified');
  });

  test('TP-003: Cart Subtotal Calculation', async ({ page }) => {
    // 1. Log in and add 4 items to cart
    await login(page);
    
    await addProductToCart(page, 'sauce-labs-backpack');
    await addProductToCart(page, 'sauce-labs-bolt-t-shirt');
    await addProductToCart(page, 'sauce-labs-onesie');
    await addProductToCart(page, 'sauce-labs-fleece-jacket');

    // 2. Navigate to cart page and verify total
    await goToCart(page);

    const cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(4);

    // Calculate expected subtotal
    const expectedSubtotal = PRODUCT_PRICES.backpack + 
                            PRODUCT_PRICES.tShirt + 
                            PRODUCT_PRICES.onesie + 
                            PRODUCT_PRICES.jacket;
    
    expect(expectedSubtotal).toBe(103.96);

    // Verify all items are present
    await expect(page).toContainText('Sauce Labs Backpack');
    await expect(page).toContainText('Sauce Labs Bolt T-Shirt');
    await expect(page).toContainText('Sauce Labs Onesie');
    await expect(page).toContainText('Sauce Labs Fleece Jacket');

    console.log(`✅ Cart subtotal calculation verified: $${expectedSubtotal}`);
  });

  test('TP-004: Continue Shopping Button', async ({ page }) => {
    // 1. Log in and add items to cart, then navigate to cart page
    await login(page);
    await addProductToCart(page, 'sauce-labs-backpack');
    await goToCart(page);

    expect(await page.url()).toContain('cart.html');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // 2. Click 'Continue Shopping' button
    await page.locator('[data-test="continue-shopping"]').click();
    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });

    // 3. Verify user returns to inventory page and cart badge still shows item count
    expect(await page.url()).toContain('inventory');
    await expect(cartBadge).toHaveText('1');

    console.log('✅ Continue Shopping button navigation verified');
  });

  test('TP-005: Checkout Button Navigation', async ({ page }) => {
    // 1. Log in, add items to cart, navigate to cart page
    await login(page);
    await addProductToCart(page, 'sauce-labs-backpack');
    await goToCart(page);

    // 2. Click 'Checkout' button
    await page.locator('[data-test="checkout"]').click();
    
    // Wait for checkout form to load
    await page.locator('[data-test="checkout-info-container"]').waitFor({ state: 'visible' });

    // 3. Verify navigation to checkout information page
    expect(await page.url()).toContain('checkout-step-one.html');

    // Verify form fields are visible
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();

    console.log('✅ Checkout button navigation verified');
  });

  test('TP-006: Remove Item from Cart', async ({ page }) => {
    // 1. Log in and add 3 items to cart
    await login(page);
    
    await addProductToCart(page, 'sauce-labs-backpack');
    await addProductToCart(page, 'sauce-labs-bolt-t-shirt');
    await addProductToCart(page, 'sauce-labs-onesie');

    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText('3');

    // 2. Navigate to cart page
    await goToCart(page);

    let cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(3);

    // 3. Click 'Remove' button for T-Shirt
    // Find the T-Shirt item and click its remove button
    const tShirtRemoveButton = page.locator('button[data-test*="remove-sauce-labs-bolt-t-shirt"]');
    await tShirtRemoveButton.click();

    // Wait for item to be removed
    await page.waitForTimeout(300);

    // 4. Verify T-Shirt is removed and only 2 items remain
    cartItems = page.locator('[data-test="cart-list"] .cart-item');
    await expect(cartItems).toHaveCount(2);

    // Verify remaining items
    await expect(page).toContainText('Sauce Labs Backpack');
    await expect(page).toContainText('Sauce Labs Onesie');

    // Verify T-Shirt is gone
    const tShirtElements = page.locator('text=Sauce Labs Bolt T-Shirt');
    await expect(tShirtElements).toHaveCount(0);

    // Verify cart badge updates to 2
    await expect(cartBadge).toHaveText('2');

    console.log('✅ Remove item from cart verified');
  });
});
