// const { test, expect } = require('@playwright/test');

// test('basic test', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//   const title = page.locator('.navbar__inner .navbar__title');
//   await expect(title).toHaveText('Playwright');
// });

// example.spec.js
const { test, expect } = require('@playwright/test')

test('example test', async ({ page }) => {
  // await page.goto('https://playwright.dev/');
  await page.goto('http://localhost:8888/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ssc/)

  // Expect an attribute "to be strictly equal" to the value.
  // await expect(page.locator('text=Get Started').first())
  //   .toHaveAttribute('href', '/docs/intro');

  // await page.click('text=Get Started');
  // // Expect some text to be visible on the page.
  // await expect(page.locator('text=Introduction').first()).toBeVisible();
})
