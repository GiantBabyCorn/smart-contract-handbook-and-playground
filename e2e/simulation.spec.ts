import { test, expect, type Page } from '@playwright/test';

/**
 * Phase 1 simulation-visualization e2e (plan §5 acceptance):
 * - erc20: changing the amount param drives REAL computed state changes —
 *   the StateChangesPanel row reflects the entered amount and a storage-node
 *   value badge appears on the flow canvas.
 * - uniswap-v2: running the swap with amountIn=100 vs 500 produces different
 *   computed outputs (reserves change accordingly).
 */

/** Scroll the app's main scroll container to the bottom so lazy sections mount. */
async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    const main = document.getElementById('main-content');
    if (main) main.scrollTo({ top: main.scrollHeight });
    window.scrollTo(0, document.body.scrollHeight);
  });
}

async function openDrawer(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open simulation panel' }).click();
}

test.describe('Simulation visualization', () => {
  test('erc20: computed state changes reflect the entered amount + storage badge', async ({ page }) => {
    await page.goto('/erc20?lng=en');
    await page.waitForLoadState('networkidle');

    // Mount the lazy flow section so storage-node badges can render.
    await scrollToBottom(page);
    await page.waitForTimeout(600);
    await scrollToBottom(page);
    await expect(page.locator('.react-flow__node').first()).toBeVisible({ timeout: 20000 });

    await openDrawer(page);
    await page.locator('#sim-scenario-select').selectOption('basic-transfer');

    // Transfer 250 tokens (wei input) instead of the default 100.
    const amount = page.locator('#sim-param-amount');
    await amount.fill('250000000000000000000');

    const stepForward = page.getByRole('button', { name: 'Step Forward' });
    const drawer = page.getByRole('dialog', { name: 'Simulation' });

    await stepForward.click();
    await expect(drawer).toContainText('Step 1 of 4');

    // StateChangesPanel shows a row whose new value reflects 1000 − 250 = 750.
    const panel = page.getByTestId('state-changes-panel');
    await expect(panel.getByTestId('state-change-row').first()).toBeVisible();
    await expect(panel).toContainText('750');

    // Step 2 touches the storage node — its live value badge shows 750 too.
    await stepForward.click();
    await expect(drawer).toContainText('Step 2 of 4');
    await expect(
      page.getByTestId('node-value-badge').filter({ hasText: '750' }).first(),
    ).toBeVisible();
    // And the recipient side of the computed transfer.
    await expect(panel).toContainText('250');
  });

  test('uniswap-v2: swap outputs differ for amountIn=100 vs 500', async ({ page }) => {
    await page.goto('/uniswap-v2?lng=en');
    await page.waitForLoadState('networkidle');

    await openDrawer(page);
    await page.locator('#sim-scenario-select').selectOption('token-swap');

    const amountIn = page.locator('#sim-param-amountIn');
    const stepForward = page.getByRole('button', { name: 'Step Forward' });
    const drawer = page.getByRole('dialog', { name: 'Simulation' });
    const panel = page.getByTestId('state-changes-panel');

    // Run 1: amountIn = 100 tokens.
    await amountIn.fill('100000000000000000000');
    await stepForward.click();
    await expect(drawer).toContainText('Step 1 of 4');
    await stepForward.click();
    await expect(drawer).toContainText('Step 2 of 4');
    await stepForward.click();
    await expect(drawer).toContainText('Step 3 of 4');
    await expect(panel).toContainText('1,000 → 1,100 TOKEN-A');
    const run100 = (await panel.textContent()) ?? '';

    // Changing the param invalidates and resets the computed run.
    await amountIn.fill('500000000000000000000');
    await expect(drawer).toContainText('Step 0 of 4');

    // Run 2: amountIn = 500 tokens → different reserves and output.
    await stepForward.click();
    await expect(drawer).toContainText('Step 1 of 4');
    await stepForward.click();
    await expect(drawer).toContainText('Step 2 of 4');
    await stepForward.click();
    await expect(drawer).toContainText('Step 3 of 4');
    await expect(panel).toContainText('1,000 → 1,500 TOKEN-A');
    const run500 = (await panel.textContent()) ?? '';

    expect(run500).not.toBe(run100);
  });
});
