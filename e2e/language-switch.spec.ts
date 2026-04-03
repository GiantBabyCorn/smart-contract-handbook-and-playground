import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('page renders without raw i18n keys visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Raw i18n keys look like "slug.section.detail" - should not be visible
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('home.hero.title');
    expect(body).not.toContain('common.nav.home');
  });

  test('detail page shows translated content, not raw keys', async ({ page }) => {
    await page.goto('/erc20');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    // The page should not show raw translation keys
    expect(body).not.toContain('erc20.introduction');
    expect(body).not.toContain('erc20.designPurpose');
  });
});
