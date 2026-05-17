import { expect, test } from '@playwright/test';

test.describe('admin · access control', () => {
  test('unauthenticated visitor is redirected to web login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });
});
