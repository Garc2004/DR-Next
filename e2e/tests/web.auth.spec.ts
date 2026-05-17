import { expect, test } from '@playwright/test';

test.describe('web · auth flow', () => {
  test('unauthenticated visitor is redirected to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Entrar')).toBeVisible();
  });

  test('login form rejects empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Informe um usuário válido')).toBeVisible();
  });
});
