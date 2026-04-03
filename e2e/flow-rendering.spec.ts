import { test, expect } from '@playwright/test';

test.describe('Flow Diagram Rendering', () => {
  test('erc20 detail page has a React Flow canvas', async ({ page }) => {
    await page.goto('/erc20');

    // React Flow renders a div with class "react-flow"
    const flowCanvas = page.locator('.react-flow');
    await expect(flowCanvas).toBeVisible({ timeout: 15000 });
  });

  test('flow canvas contains rendered nodes', async ({ page }) => {
    await page.goto('/erc20');

    const flowCanvas = page.locator('.react-flow');
    await expect(flowCanvas).toBeVisible({ timeout: 15000 });

    // React Flow renders nodes inside .react-flow__node elements
    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 10000 });

    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('flow nodes have visible text content', async ({ page }) => {
    await page.goto('/erc20');

    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });

    // Check that first node has some text
    const firstNode = nodes.first();
    const text = await firstNode.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('no two nodes overlap at the same position', async ({ page }) => {
    await page.goto('/erc20');

    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });

    const count = await nodes.count();
    const positions: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < count; i++) {
      const box = await nodes.nth(i).boundingBox();
      if (box) {
        positions.push({ x: Math.round(box.x), y: Math.round(box.y) });
      }
    }

    // Check no two nodes share the exact same position
    const posSet = new Set(positions.map((p) => `${p.x},${p.y}`));
    expect(posSet.size).toBe(positions.length);
  });
});
