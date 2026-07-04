import { test, expect, type Page } from '@playwright/test';

/**
 * Detail-page schema v2 sections (plan.md §7 / Phase 3a).
 *
 * erc165 is the first entry with v2 content (security / codeExamples /
 * gasNotes / references / eipStatus), so it doubles as the fixture:
 *   - the new sections render with translated headings (en + zh-TW)
 *   - the TOC rail lists exactly the sections present and navigates
 *   - hash deep-links work on a cold load (LazySection force-mount fix)
 *   - prev/next navigation walks sortOrder order
 *   - every section heading exposes an anchor-copy button
 */

const LOCALES = ['en', 'zh-TW'] as const;
type Locale = (typeof LOCALES)[number];

const COPY: Record<
  Locale,
  {
    security: string;
    codeExamples: string;
    gas: string;
    references: string;
    functions: string;
    toc: string;
    severityMedium: string;
  }
> = {
  en: {
    security: 'Security Considerations',
    codeExamples: 'Code Examples',
    gas: 'Gas Notes',
    references: 'References',
    functions: 'Functions & Events',
    toc: 'On this page',
    severityMedium: 'Medium',
  },
  'zh-TW': {
    security: '安全性考量',
    codeExamples: '程式碼範例',
    gas: 'Gas 說明',
    references: '參考資料',
    functions: '函式與事件',
    toc: '目錄',
    severityMedium: '中風險',
  },
};

/** Navigate with the locale pinned via localStorage + ?lng= (querystring wins). */
async function gotoWithLocale(page: Page, path: string, locale: Locale, hash = ''): Promise<void> {
  await page.addInitScript((lng) => {
    window.localStorage.setItem('i18nextLng', lng);
  }, locale);
  await page.goto(`${path}?lng=${encodeURIComponent(locale)}${hash}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Scroll the app's main scroll container to the bottom in viewport-sized
 * steps so every LazySection passes through the IntersectionObserver margin
 * and mounts (an instant jump would leave mid-page sections unmounted).
 * scrollHeight is re-read each step because sections grow as they mount.
 */
async function scrollThroughPage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const step = Math.max(200, main.clientHeight * 0.8);
    let guard = 0;
    while (main.scrollTop + main.clientHeight < main.scrollHeight - 4 && guard < 60) {
      main.scrollTo({ top: main.scrollTop + step });
      await new Promise((resolve) => setTimeout(resolve, 120));
      guard += 1;
    }
  });
}

for (const locale of LOCALES) {
  const copy = COPY[locale];

  test.describe(`detail sections [${locale}]`, () => {
    test('schema v2 sections render on /erc165', async ({ page }) => {
      await gotoWithLocale(page, '/erc165', locale);

      // Header: official EIP status badge (proper noun, untranslated).
      await expect(
        page.locator('#main-content [data-testid="status-badge"]'),
      ).toHaveText('Final');

      // Lazy sections mount as they approach the viewport — scroll through.
      await scrollThroughPage(page);

      // Security section: heading + severity badge (icon + text, not colour-only).
      await expect(
        page.getByRole('heading', { name: copy.security, exact: true }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#security')).toContainText(copy.severityMedium);

      // Code example: canonical supportsInterface interface via CodeBlock.
      await expect(
        page.getByRole('heading', { name: copy.codeExamples, exact: true }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#code-examples')).toContainText(
        'function supportsInterface(bytes4 interfaceID) external view returns (bool);',
      );

      // Gas notes: the 30k gas cap callout.
      await expect(page.getByRole('heading', { name: copy.gas, exact: true })).toBeVisible();
      await expect(page.locator('#gas')).toContainText('30,000');

      // References: literal resource label with an external link.
      await expect(
        page.getByRole('heading', { name: copy.references, exact: true }),
      ).toBeVisible();
      await expect(
        page.locator('#references a[href*="OpenZeppelin/openzeppelin-contracts"]'),
      ).toBeVisible();
    });

    test('TOC rail lists present sections and navigates', async ({ page }) => {
      await gotoWithLocale(page, '/erc165', locale);

      const toc = page.locator('[data-testid="toc-rail"]');
      await expect(toc).toBeVisible();
      await expect(toc).toContainText(copy.toc);

      // Every present section is listed; erc165 has no errors/composition,
      // so those anchors must be absent.
      for (const id of [
        '#introduction',
        '#design-purpose',
        '#common-usage',
        '#flow-diagram',
        '#functions',
        '#security',
        '#code-examples',
        '#gas',
        '#references',
        '#related',
      ]) {
        await expect(toc.locator(`a[href="${id}"]`)).toHaveCount(1);
      }
      await expect(toc.locator('a[href="#errors"]')).toHaveCount(0);
      await expect(toc.locator('a[href="#composition"]')).toHaveCount(0);

      // Clicking a TOC item force-mounts lazy sections, scrolls to the
      // target, and records the hash without a router navigation.
      await toc.locator('a[href="#references"]').click();
      await expect(page.locator('#references')).toBeInViewport({ timeout: 10000 });
      expect(new URL(page.url()).hash).toBe('#references');
    });

    test('hash deep-link /erc165#functions works on a cold load', async ({ page }) => {
      await gotoWithLocale(page, '/erc165', locale, '#functions');

      await expect(page.locator('#functions')).toBeInViewport({ timeout: 10000 });
      await expect(
        page.getByRole('heading', { name: new RegExp(copy.functions) }),
      ).toBeVisible();
    });

    test('prev/next navigation walks the catalog order', async ({ page }) => {
      await gotoWithLocale(page, '/erc165', locale);

      const nav = page.locator('[data-testid="prev-next-nav"]');
      await nav.scrollIntoViewIfNeeded();
      await expect(nav).toBeVisible();

      const prevLink = nav.locator('a[rel="prev"]');
      const nextLink = nav.locator('a[rel="next"]');
      await expect(prevLink).toHaveCount(1);
      await expect(nextLink).toHaveCount(1);
      await expect(prevLink).toHaveAttribute('aria-label', /.+/);

      const nextHref = await nextLink.getAttribute('href');
      expect(nextHref).toBeTruthy();
      await nextLink.click();
      await expect(page).toHaveURL(new RegExp(`${nextHref}$`));
      // The destination entry renders (h1 present, not the 404 page).
      await expect(page.locator('#main-content h1').first()).toBeVisible();
    });

    test('section headings expose an anchor-copy button', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await gotoWithLocale(page, '/erc165', locale);

      const introHeader = page.locator('#introduction');
      await expect(introHeader).toBeVisible();

      const copyButton = introHeader.locator('[data-testid="section-anchor-copy"]');
      await expect(copyButton).toHaveCount(1);
      await expect(copyButton).toHaveAttribute('aria-label', /.+/);

      // Appears on hover, and clicking copies the section URL with its hash.
      await introHeader.locator('h2').hover();
      await copyButton.click();
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboard).toContain('/erc165');
      expect(clipboard).toContain('#introduction');
    });
  });
}

test('mobile TOC is a collapsible disclosure above the content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithLocale(page, '/erc165', 'zh-TW');

  // Rail is hidden on mobile; the disclosure replaces it.
  await expect(page.locator('[data-testid="toc-rail"]')).toBeHidden();
  const mobileToc = page.locator('[data-testid="toc-mobile"]');
  await expect(mobileToc).toBeVisible();
  await expect(mobileToc).toContainText('目錄');

  // Collapsed by default; expanding reveals the section links.
  await expect(mobileToc.locator('a[href="#security"]')).toHaveCount(0);
  await mobileToc.getByRole('button').click();
  await expect(mobileToc.locator('a[href="#security"]')).toHaveCount(1);

  await mobileToc.locator('a[href="#security"]').click();
  await expect(page.locator('#security')).toBeInViewport({ timeout: 10000 });
});
