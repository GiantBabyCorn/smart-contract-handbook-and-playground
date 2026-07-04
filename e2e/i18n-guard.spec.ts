import { test, expect, type Page } from '@playwright/test';

/**
 * i18n raw-key guard (plan.md P0-9c).
 *
 * For each locale x page combination, assert that no raw entry-content i18n
 * keys (e.g. "erc20.fn.transfer.desc") and no "TODO:" placeholders are present
 * in the rendered document text. This includes lazily mounted sections (flow
 * diagram, simulation content) and the simulation drawer: even while closed
 * (translated off-canvas) its content is in the DOM, so innerText covers it --
 * exactly what we want to catch.
 *
 * Locale list is intentionally small to keep CI fast; add locales here to
 * widen coverage (all 6: en, zh-CN, zh-TW, ja, ko, es).
 */
const LOCALES = ['en', 'zh-TW', 'ja'] as const;

/** Home + one standard + one protocol + playground. */
const PAGES = ['/', '/erc20', '/uniswap-v2', '/playground'] as const;

/**
 * Raw entry-content keys look like "<slug>.(fn|node|edge|sim).<rest>".
 * Superset of the required guard pattern /\b[a-z0-9-]+\.(fn|node|edge|sim)\./
 * with a greedy tail so failures report the full leaked key.
 */
const RAW_KEY_RE = /\b[a-z0-9-]+\.(?:fn|node|edge|sim)\.[\w.-]*/g;

/** Scroll the app's main scroll container (and window) to the bottom so lazy sections mount. */
async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    const main = document.getElementById('main-content');
    if (main) main.scrollTo({ top: main.scrollHeight });
    window.scrollTo(0, document.body.scrollHeight);
  });
}

for (const locale of LOCALES) {
  for (const path of PAGES) {
    test(`no raw i18n keys or TODOs on ${path} [${locale}]`, async ({ page }) => {
      // Belt and braces: persisted language + ?lng= querystring detection.
      await page.addInitScript((lng) => {
        window.localStorage.setItem('i18nextLng', lng);
      }, locale);

      await page.goto(`${path}?lng=${encodeURIComponent(locale)}`);
      await page.waitForLoadState('networkidle');

      // Flow diagram / simulation drawer content mounts lazily on scroll --
      // scroll, let it settle, wait out any follow-up chunk/i18n requests,
      // then scroll again in case scrollHeight grew after the lazy mount.
      await scrollToBottom(page);
      await page.waitForTimeout(1200);
      await page.waitForLoadState('networkidle');
      await scrollToBottom(page);
      await page.waitForTimeout(400);

      const text = await page.evaluate(() => document.body.innerText);

      const leakedKeys = [...new Set(text.match(RAW_KEY_RE) ?? [])];
      expect(leakedKeys, `raw i18n keys visible on ${path} [${locale}]`).toEqual([]);
      expect(text, `"TODO:" placeholder visible on ${path} [${locale}]`).not.toContain('TODO:');
    });
  }
}
