import { test, expect, type Page } from '@playwright/test';

/**
 * Phase 4.0 IA overhaul (plan.md 8.0): /catalog table, search v2
 * (sidebar full-text + Ctrl-K palette), and the collapsed-sidebar tab order.
 */

const PUBLISHED_TOTAL = 35;
const DEFI_COUNT = 10;

/** Wait until the app shell is hydrated and i18n has settled. */
async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('topbar-search-button')).toBeVisible();
}

test.describe('/catalog page', () => {
  test('renders all published entries as rows', async ({ page }) => {
    await gotoReady(page, '/catalog');
    await expect(page.getByTestId('catalog-table')).toBeVisible();
    await expect(page.locator('tbody tr[data-slug]')).toHaveCount(PUBLISHED_TOTAL);
    // Default sort: EIP ascending — ERC-20 first.
    await expect(page.locator('tbody tr[data-slug]').first()).toHaveAttribute('data-slug', 'erc20');
  });

  test('category filter narrows rows and syncs the URL', async ({ page }) => {
    await gotoReady(page, '/catalog');
    await page.getByTestId('catalog-filter-category').selectOption('defi');
    await expect(page.locator('tbody tr[data-slug]')).toHaveCount(DEFI_COUNT);
    await expect(page).toHaveURL(/category=defi/);

    // Deep link with the same filter works too (sidebar "view all" target).
    await gotoReady(page, '/catalog?category=defi');
    await expect(page.locator('tbody tr[data-slug]')).toHaveCount(DEFI_COUNT);
  });

  test('status badges are visible', async ({ page }) => {
    await gotoReady(page, '/catalog');
    const badges = page.getByTestId('status-badge');
    await expect(badges.first()).toBeVisible();
    expect(await badges.count()).toBeGreaterThan(0);
    await expect(badges.filter({ hasText: 'Final' }).first()).toBeVisible();
  });

  test('clicking a row navigates to the entry', async ({ page }) => {
    await gotoReady(page, '/catalog');
    // Click a plain cell (not the name link) to exercise the row handler.
    await page.locator('tr[data-slug="erc4626"] td').nth(2).click();
    await expect(page).toHaveURL(/\/erc4626$/);
  });
});

test.describe('search v2', () => {
  test('Ctrl-K palette: "swap" surfaces Uniswap V2, Enter navigates', async ({ page }) => {
    await gotoReady(page, '/');
    await page.keyboard.press('Control+k');

    const palette = page.getByTestId('command-palette');
    await expect(palette).toBeVisible();

    await page.keyboard.type('swap');
    const uniswapOption = palette.locator('[role="option"][data-slug="uniswap-v2"]');
    await expect(uniswapOption).toBeVisible();

    // Arrow down until Uniswap V2 is the active option, then Enter.
    for (let i = 0; i < 12; i++) {
      const selected = await uniswapOption.getAttribute('aria-selected');
      if (selected === 'true') break;
      await page.keyboard.press('ArrowDown');
    }
    await expect(uniswapOption).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/uniswap-v2$/);
    await expect(palette).toBeHidden();
  });

  test('TopBar button opens the palette; Escape closes it', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByTestId('topbar-search-button').click();
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('command-palette')).toBeHidden();
  });

  test('sidebar search is full-text: "royalty" finds ERC-2981', async ({ page }) => {
    await gotoReady(page, '/');
    const input = page.locator('aside input[type="search"]');
    await input.click();
    await input.fill('royalty');

    const option = page.locator('aside a[role="option"][data-slug="erc2981"]');
    await expect(option).toBeVisible();
    await expect(option).toContainText('ERC-2981');
  });
});

test.describe('a11y: skip link and collapsed-sidebar tab order', () => {
  test('with the sidebar open, Tab passes from the skip link into the sidebar', async ({
    page,
  }) => {
    await gotoReady(page, '/erc20');
    await page.locator('body').press('Tab'); // -> skip link
    await expect(page.locator('a[href$="#main-content"]')).toBeFocused();

    await page.keyboard.press('Tab');
    const inAside = await page.evaluate(() => !!document.activeElement?.closest('aside'));
    expect(inAside).toBe(true); // control case: inert is NOT applied while open
  });

  test('with the sidebar collapsed, hidden controls leave the tab order', async ({ page }) => {
    await gotoReady(page, '/erc20');
    // Click leaves focus on the TopBar toggle — the first focusable AFTER the
    // sidebar. Shift+Tab must then skip the entire inert sidebar and land
    // directly on the skip link (the only earlier tab stop).
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();

    await page.keyboard.press('Shift+Tab');
    const skipLink = page.locator('a[href$="#main-content"]');
    await expect(skipLink).toBeFocused();

    // Forward again: the next tab stop is NOT inside the (inert) sidebar.
    await page.keyboard.press('Tab');
    const inAside = await page.evaluate(() => !!document.activeElement?.closest('aside'));
    expect(inAside).toBe(false);

    // Activating the skip link moves focus to the main content region.
    await page.keyboard.press('Shift+Tab'); // back to the skip link
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? '');
    expect(focusedId).toBe('main-content');
  });
});
