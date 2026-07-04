import { test, expect } from '@playwright/test';

/**
 * Playground UX (plan.md Phase 2):
 *  (a) add two entries via click → nodes appear, function panel groups by contract
 *  (b) remove one entry → its functions and nodes leave zero residue
 *  (c) share URL restores the canvas in a brand-new browser context
 *  (d) mobile (390x844): palette bottom sheet + tap-to-place
 */

const NODE_OF = (slug: string) => `.react-flow__node[data-id^="${slug}--"]`;

test.beforeEach(async ({ page }) => {
  // Isolate from any autosaved canvas of previous tests / sessions.
  await page.addInitScript(() => {
    window.localStorage.removeItem('erc-playground-state');
  });
});

test('adds two entries via click and groups the function panel by contract', async ({
  page,
}) => {
  await page.goto('/playground?lng=en');

  await page.getByTestId('palette-add-erc20').click();
  await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible({
    timeout: 20_000,
  });

  await page.getByTestId('palette-add-erc2612').click();
  await expect(page.locator(NODE_OF('erc2612')).first()).toBeVisible({
    timeout: 20_000,
  });

  // Function panel groups by contract (one collapsible header per entry).
  await expect(page.getByTestId('fn-group-erc20')).toBeVisible();
  await expect(page.getByTestId('fn-group-erc2612')).toBeVisible();
});

test('removing an entry leaves no residue in canvas or function panel', async ({
  page,
}) => {
  await page.goto('/playground?lng=en');

  await page.getByTestId('palette-add-erc20').click();
  await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible({
    timeout: 20_000,
  });
  await page.getByTestId('palette-add-erc2612').click();
  await expect(page.getByTestId('fn-group-erc2612')).toBeVisible({
    timeout: 20_000,
  });

  await page.getByTestId('palette-remove-erc2612').click();

  await expect(page.getByTestId('fn-group-erc2612')).toHaveCount(0);
  await expect(page.locator(NODE_OF('erc2612'))).toHaveCount(0);
  // The other entry is untouched.
  await expect(page.getByTestId('fn-group-erc20')).toBeVisible();
  await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible();
});

test('share URL restores the canvas in a new browser context', async ({
  page,
  browser,
}) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/playground?lng=en');

  await page.getByTestId('palette-add-erc20').click();
  await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible({
    timeout: 20_000,
  });
  await page.getByTestId('palette-add-erc721').click();
  await expect(page.locator(NODE_OF('erc721')).first()).toBeVisible({
    timeout: 20_000,
  });

  await page.getByTestId('playground-share').click();
  await expect(page.getByTestId('playground-toast')).toBeVisible();

  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(sharedUrl).toContain('state=');

  // Brand-new context: no localStorage, no cookies — only the URL state.
  const context = await browser.newContext();
  const restored = await context.newPage();
  await restored.goto(sharedUrl);

  await expect(restored.locator(NODE_OF('erc20')).first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(restored.locator(NODE_OF('erc721')).first()).toBeVisible();
  // The bulky param is cleaned from the URL bar after restore.
  await restored.waitForFunction(
    () => !window.location.search.includes('state='),
  );

  await context.close();
});

test('executes a function and narrates the current step', async ({ page }) => {
  await page.goto('/playground?lng=en');

  await page.getByTestId('palette-add-erc20').click();
  await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible({
    timeout: 20_000,
  });
  await page.getByTestId('palette-add-erc721').click();
  await expect(page.locator(NODE_OF('erc721')).first()).toBeVisible({
    timeout: 20_000,
  });

  // Several user nodes on the canvas → the entry-point dropdown appears.
  const entryPoint = page.getByTestId('entry-point-select');
  await expect(entryPoint).toBeVisible();
  expect(await entryPoint.locator('option').count()).toBeGreaterThan(1);

  await page.getByTestId('fn-item-erc20-transfer').click();
  await page.getByTestId('interactive-execute').click();

  // Step through: narration renders the translated, human-readable text
  // (no raw node ids like "erc20--user", no raw i18n keys).
  await page.getByRole('button', { name: 'Step forward' }).click();
  const narration = page.getByTestId('interactive-step-desc');
  await expect(narration).toBeVisible();
  const text = (await narration.textContent()) ?? '';
  expect(text).toMatch(/^Start from /);
  expect(text).not.toMatch(/erc20--/);
  expect(text).not.toMatch(/\berc20\.(node|fn|sim)\./);
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens the palette drawer and places an entry by tapping', async ({
    page,
  }) => {
    await page.goto('/playground?lng=en');

    await page.getByTestId('playground-open-palette').click();
    await expect(page.getByTestId('playground-palette-sheet')).toBeVisible();

    // Tapping an item arms tap-to-place and closes the sheet.
    await page.getByTestId('mpalette-add-erc20').click();
    await expect(page.getByTestId('playground-palette-sheet')).toHaveCount(0);
    await expect(page.getByTestId('placing-hint')).toBeVisible();

    // Tap the canvas to place the entry there.
    await page
      .locator('.react-flow__pane')
      .click({ position: { x: 200, y: 300 } });

    await expect(page.getByTestId('placing-hint')).toHaveCount(0);
    await expect(page.locator(NODE_OF('erc20')).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
