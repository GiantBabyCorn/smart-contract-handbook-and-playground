#!/usr/bin/env node
/**
 * Template-injection prerender (plan.md §10.1 — no headless browser).
 *
 * Run AFTER `vite build`:
 *     node scripts/prerender.mjs          (or: npm run prerender = build + this)
 *
 * For every route the SPA serves — `/`, `/catalog`, `/playground` and one
 * `/:slug` per PUBLISHED entry — this script copies `dist/index.html` to
 * `dist/<route>/index.html` with route-specific SEO tags injected:
 *
 *   <title>, <meta name="description">, <link rel="canonical">,
 *   og:title / og:description / og:url / og:image, twitter:* mirrors,
 *   plus a <noscript> summary paragraph for crawlers.
 *
 * Injection is done with precise attribute-scoped replacements on the built
 * template, so everything else in <head> — most importantly the pre-paint
 * theme bootstrap <script> — is preserved byte-for-byte. The `/` route only
 * receives the <noscript> block (the built template's head IS the homepage
 * head). A marker-comment wrapper keeps the script idempotent: re-running it
 * strips its previous <noscript> injection before re-injecting.
 *
 * Route + content sources (single source of truth, same set as sitemap):
 *   - src/data/catalog.json          published standard rows (JSON, authoritative)
 *   - src/data/allMeta.ts            display names for standards (generated file)
 *   - src/data/protocolsMeta.ts      protocol slugs + names (hand-maintained)
 *   - src/i18n/locales/en/*.json     catalog (per-entry short), common, home
 *   - src/utils/constants.ts         SITE_URL
 *
 * v1 is en-only; `/:lng/` static locale routes are a deferred one-time URL
 * decision (plan §10.1). Vercel serves real files before applying the SPA
 * rewrite in vercel.json (filesystem-first), so non-prerendered paths still
 * fall back to the SPA shell.
 *
 * Exit codes: 0 ok, 1 template/data problem (fails loudly — a silent partial
 * injection would ship wrong SEO tags).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const LOCALES_EN = join(ROOT, 'src', 'i18n', 'locales', 'en');

const NOSCRIPT_START = '<!-- prerender:noscript:start -->';
const NOSCRIPT_END = '<!-- prerender:noscript:end -->';

function fail(message) {
  console.error(`prerender: ERROR: ${message}`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadSiteUrl() {
  const constants = readFileSync(join(ROOT, 'src', 'utils', 'constants.ts'), 'utf8');
  const m = constants.match(/SITE_URL\s*=\s*'([^']+)'/);
  if (!m) fail('SITE_URL not found in src/utils/constants.ts');
  return m[1].replace(/\/+$/, '');
}

/** Parse `slug: '...'` / `name: '...'` pairs from a generated/hand-kept meta TS file. */
function parseMetaNames(path) {
  const names = new Map();
  const source = readFileSync(path, 'utf8');
  const re = /slug:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?name:\s*'((?:[^'\\]|\\.)*)'/g;
  const unescape = (s) => s.replace(/\\(['\\])/g, '$1');
  for (const m of source.matchAll(re)) {
    names.set(unescape(m[1]), unescape(m[2]));
  }
  return names;
}

function buildRoutes() {
  const siteUrl = loadSiteUrl();
  const catalog = readJson(join(ROOT, 'src', 'data', 'catalog.json'));
  const shorts = readJson(join(LOCALES_EN, 'catalog.json'));
  const common = readJson(join(LOCALES_EN, 'common.json'));
  const home = readJson(join(LOCALES_EN, 'home.json'));

  const standardNames = parseMetaNames(join(ROOT, 'src', 'data', 'allMeta.ts'));
  const protocolNames = parseMetaNames(join(ROOT, 'src', 'data', 'protocolsMeta.ts'));

  const siteName = 'Smart Contract Handbook';
  const fullTitle = (title) => `${title} — ${siteName}`;

  /** @type {{route: string, title: string|null, description: string, url: string, image: string, noscript: string}[]} */
  const routes = [];

  // `/` — head already correct in the built template; only add <noscript>.
  routes.push({
    route: '',
    title: null,
    description: home.description,
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-image.png`,
    noscript: `<h1>${escapeHtml(home.title)}</h1><p>${escapeHtml(home.description)}</p>`,
  });

  routes.push({
    route: 'catalog',
    title: fullTitle(common.catalogUi.title),
    description: common.catalogUi.description,
    url: `${siteUrl}/catalog`,
    image: `${siteUrl}/og/catalog.png`,
    noscript:
      `<h1>${escapeHtml(common.catalogUi.title)} — ${escapeHtml(siteName)}</h1>` +
      `<p>${escapeHtml(common.catalogUi.description)}</p>`,
  });

  routes.push({
    route: 'playground',
    title: fullTitle(common.playground.title),
    description: common.playground.subtitle,
    url: `${siteUrl}/playground`,
    // No dedicated playground OG card exists — use the site default.
    image: `${siteUrl}/og-image.png`,
    noscript:
      `<h1>${escapeHtml(common.playground.title)} — ${escapeHtml(siteName)}</h1>` +
      `<p>${escapeHtml(common.playground.subtitle)}</p>`,
  });

  // Published standards (catalog.json is authoritative for the route set;
  // allMeta.ts supplies the curated display names the SPA shows).
  const published = catalog.filter((row) => row.published === true);
  if (published.length === 0) fail('catalog.json has no published rows — route set would be empty');

  const entries = published.map((row) => ({
    slug: row.slug,
    name: standardNames.get(row.slug) ?? row.title ?? row.slug,
    short: shorts[`${row.slug}.short`] ?? row.title ?? '',
  }));

  // Protocols (not in the ERC catalog; hand-maintained meta file).
  for (const [slug, name] of protocolNames) {
    entries.push({ slug, name, short: shorts[`${slug}.short`] ?? '' });
  }

  for (const entry of entries) {
    if (!/^[a-z0-9-]+$/.test(entry.slug)) fail(`unsafe slug "${entry.slug}" — refusing to write`);
    const description = entry.short || `${entry.name} on ${siteName}.`;
    routes.push({
      route: entry.slug,
      title: fullTitle(entry.name),
      description,
      url: `${siteUrl}/${entry.slug}`,
      // Per-entry OG card. Referenced even when the PNG is not generated yet
      // (plan §8.0 moves OG generation to deploy time for 350 entries).
      image: `${siteUrl}/og/${entry.slug}.png`,
      noscript: `<h1>${escapeHtml(entry.name)} — ${escapeHtml(siteName)}</h1><p>${escapeHtml(description)}</p>`,
    });
  }

  return routes;
}

// ---------------------------------------------------------------------------
// HTML injection
// ---------------------------------------------------------------------------

/** Replace exactly one occurrence matched by `re`; fail loudly otherwise. */
function replaceOne(html, re, replacement, what) {
  const matches = html.match(re);
  if (!matches || matches.length !== 1) {
    fail(
      `expected exactly 1 match for ${what} in dist/index.html, found ${matches ? matches.length : 0}. ` +
        'index.html structure changed — update scripts/prerender.mjs.',
    );
  }
  return html.replace(re, replacement);
}

function setTitle(html, title) {
  return replaceOne(html, /<title>[\s\S]*?<\/title>/g, `<title>${escapeHtml(title)}</title>`, '<title>');
}

function setMetaByName(html, name, content) {
  const re = new RegExp(`(<meta\\s+name="${name}"\\s+content=")[^"]*(")`, 'g');
  return replaceOne(html, re, `$1${escapeHtml(content)}$2`, `meta[name="${name}"]`);
}

function setMetaByProperty(html, property, content) {
  const re = new RegExp(`(<meta\\s+property="${property}"\\s+content=")[^"]*(")`, 'g');
  return replaceOne(html, re, `$1${escapeHtml(content)}$2`, `meta[property="${property}"]`);
}

function setCanonical(html, url) {
  const re = /(<link\s+rel="canonical"\s+href=")[^"]*(")/g;
  return replaceOne(html, re, `$1${escapeHtml(url)}$2`, 'link[rel="canonical"]');
}

function injectNoscript(html, inner) {
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) fail(`"${marker}" not found in dist/index.html`);
  const block = `${NOSCRIPT_START}<noscript>${inner}<p><a href="/">${escapeHtml(
    'Smart Contract Handbook — interactive ERC standards & DeFi protocol explorer',
  )}</a></p></noscript>${NOSCRIPT_END}`;
  return html.replace(marker, `${marker}\n    ${block}`);
}

function renderRoute(template, route) {
  let html = template;
  if (route.title !== null) {
    html = setTitle(html, route.title);
    html = setMetaByName(html, 'description', route.description);
    html = setMetaByProperty(html, 'og:title', route.title);
    html = setMetaByProperty(html, 'og:description', route.description);
    html = setMetaByProperty(html, 'og:url', route.url);
    html = setMetaByProperty(html, 'og:image', route.image);
    html = setMetaByName(html, 'twitter:title', route.title);
    html = setMetaByName(html, 'twitter:description', route.description);
    html = setMetaByName(html, 'twitter:image', route.image);
    html = setCanonical(html, route.url);
  }
  return injectNoscript(html, route.noscript);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const started = performance.now();

  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    fail('dist/index.html not found — run `npm run build` first');
  }

  // Idempotency: strip a previous run's <noscript> injection from the
  // template before re-injecting (all other injections are value replacements
  // on the pristine template, so they cannot accumulate).
  let template = readFileSync(templatePath, 'utf8');
  const stripRe = new RegExp(`\\n?[ \\t]*${NOSCRIPT_START}[\\s\\S]*?${NOSCRIPT_END}`, 'g');
  template = template.replace(stripRe, '');

  // Guard rail: never clobber the pre-paint theme script.
  if (!template.includes('erc-explorer-theme')) {
    fail('pre-paint theme script missing from dist/index.html template');
  }

  const routes = buildRoutes();

  let written = 0;
  for (const route of routes) {
    const html = renderRoute(template, route);
    const outPath = route.route === '' ? templatePath : join(DIST, route.route, 'index.html');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, 'utf8');
    written += 1;
  }

  const elapsed = (performance.now() - started).toFixed(0);
  console.log(
    `prerender: wrote ${written} routes (${routes.length - 3} entries + /, /catalog, /playground) in ${elapsed}ms`,
  );
}

main();
