# Smart Contract Handbook

An interactive educational platform for exploring Ethereum ERC standards and DeFi protocols. Built with React, TypeScript, and React Flow.

## Features

- **Visual Flow Diagrams** -- Understand complex contract interactions through interactive node-based diagrams powered by React Flow + elkjs auto-layout
- **Live Simulations** -- Step through real transaction scenarios (transfer, approve, borrow, liquidate, etc.) with animated state changes
- **22 ERC Standards** -- From ERC-20 to ERC-7702, covering tokens, NFTs, proxies, account abstraction, identity, cross-chain, and RWA
- **13 DeFi Protocols** -- Uniswap V2/V3/V4, Aave V3, Compound V3, MakerDAO, Chainlink, Curve, Lido, EigenLayer, 1inch, Safe, OpenZeppelin Governor
- **Multilingual** -- English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Spanish
- **Dark / Light Themes** -- Full theme support via CSS custom properties

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 8 |
| Framework | React 19 + TypeScript 5.9 |
| Routing | React Router 7 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Flow Diagrams | @xyflow/react 12 + elkjs |
| Animation | Motion (Framer Motion) 12 |
| i18n | react-i18next + i18next |
| Code Highlight | Shiki |
| Ethereum Utils | viem |
| Worker Comm | comlink |
| Testing | Vitest + React Testing Library + Playwright |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Type-check + production build
npm run prerender    # Build + inject per-route SEO tags into dist/ (see "Prerendering")
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run e2e          # Run E2E tests (Playwright)
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI (ThemeToggle, SEOHead, CodeBlock, etc.)
│   ├── flow/            # React Flow components
│   │   ├── nodes/       # ContractNode, UserNode, StorageNode, ProxyNode, etc.
│   │   ├── edges/       # AnimatedEdge, LabeledEdge, FundFlowEdge
│   │   └── panels/      # SimulationPanel, LegendPanel
│   └── layout/          # Sidebar, TopBar, MobileNav
├── data/
│   ├── standards/       # 22 ERC standard definitions (erc20.ts, erc721.ts, ...)
│   ├── protocols/       # 13 protocol definitions (aave-v3.ts, uniswap-v2.ts, ...)
│   ├── types.ts         # TypeScript interfaces (ERCEntry, FlowNodeDef, etc.)
│   ├── registry.ts      # Dynamic entry loader via import.meta.glob
│   └── allMeta.ts       # Sidebar/search metadata for all entries
├── features/
│   ├── simulation/      # SimulationEngine, useSimulation hook, Web Worker
│   └── wallet/          # (placeholder for future wallet integration)
├── i18n/
│   └── locales/         # Translation files (en, zh-CN, zh-TW, ja, ko, es)
├── pages/               # HomePage, DetailPage, NotFoundPage
├── stores/              # Zustand stores
├── styles/              # CSS (themes, globals, React Flow overrides)
└── utils/               # Utility functions (cn, constants)

scripts/                 # Python automation scripts
docs/                    # Architecture docs, ADRs, setup guide
public/
└── icons/thesvg/        # Brand SVG icons (Ethereum, Solidity, Chainlink, etc.)
```

## Adding a New Standard or Protocol

Use the scaffold script to generate boilerplate:

```bash
# Add a new ERC standard
python scripts/scaffold_entry.py \
  --slug erc777 \
  --name "ERC-777" \
  --category token \
  --type standard \
  --eip 777

# Add a new protocol
python scripts/scaffold_entry.py \
  --slug sushiswap \
  --name "SushiSwap" \
  --category defi \
  --type protocol
```

This will:
1. Create a data file at `src/data/standards/<slug>.ts` or `src/data/protocols/<slug>.ts`
2. Add a metadata entry to `src/data/allMeta.ts`
3. Create an i18n translation file at `src/i18n/locales/en/<slug>.json`

After scaffolding, fill in the `functions`, `flowNodes`, `flowEdges`, and `simulations` arrays in the data file, and update the i18n file with real descriptions.

You can also use the Claude Code skill:

```
/add-entry --slug erc777 --name "ERC-777" --category token --type standard --eip 777
```

## Automation Scripts

| Script | Purpose |
|--------|---------|
| `scaffold_entry.py` | Generate new standard/protocol boilerplate |
| `sync_translations.py` | Scan for missing i18n keys and generate TODOs |
| `validate_registry.py` | Verify all data files conform to TypeScript interfaces |
| `lint_i18n_keys.py` | Validate i18n key naming follows `<slug>.<section>.<detail>` |
| `check_bundle_size.py` | Check chunk sizes after build |
| `generate_sitemap.py` | Generate `public/sitemap.xml` from allMeta |
| `generate_og_images.py` | Generate OG images for each entry |
| `export_data_summary.py` | Generate Markdown summary of all entries |
| `migrate_data_schema.py` | Backfill new fields when types.ts changes |

## i18n

Each entry has its own i18n namespace matching its slug. The `DetailPage` loads translations via `useTranslation(entry.slug)`, which dynamically imports `src/i18n/locales/{lang}/{slug}.json`.

Supported languages: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`

## CI & Deployment

GitHub Actions (`.github/workflows/ci.yml`) gates every push and pull request:

1. **quality** -- ESLint, `tsc -b` + Vite build, `prerender.mjs` (+ injected-tag
   assertions on `/erc20` and `/catalog`), Vitest, `validate_registry.py`,
   `lint_i18n_keys.py --max-identical-ratio 0.08`, and
   `check_bundle_size.py --budget-kb 250 --total-budget-kb 200`
   (main entry chunk under 250 KB gzip; total initial JS under 200 KB gzip).
2. **e2e** -- Playwright (chromium) against the dev server, including
   `e2e/i18n-guard.spec.ts`, which fails if any raw i18n key (`slug.fn.*`, `slug.node.*`,
   `slug.edge.*`, `slug.sim.*`) or `TODO:` placeholder is visible in any tested locale.

The `--max-identical-ratio` gate flags locales that copy too many English values verbatim
(i.e. untranslated content). Genuine identical values (code snippets, proper nouns) sit
around 2-3%; the CI threshold is 8%. Run with `--report` to print per-locale ratios.

Deployment target is **Vercel**: `vercel.json` rewrites all paths to `/index.html` so SPA
deep links work, and serves `/assets/*` with immutable cache headers. Vercel matches real
static files before applying rewrites, so hashed assets are unaffected.

## Prerendering (SEO)

`scripts/prerender.mjs` is a **template-injection prerenderer** (no headless browser,
ADR: plan §10.1). After `vite build` it copies `dist/index.html` to
`dist/<route>/index.html` for every route — `/`, `/catalog`, `/playground`, and one
`/:slug` per published entry — and injects route-specific `<title>`, meta description,
canonical URL, Open Graph / Twitter tags (per-entry `/og/<slug>.png` card) and a
`<noscript>` summary paragraph for crawlers. The pre-paint theme script and the rest of
the built head are preserved untouched; the script is idempotent and completes in tens
of milliseconds for ~40 routes (it scales linearly to 350+).

```bash
npm run prerender      # = npm run build && node scripts/prerender.mjs
node scripts/prerender.mjs   # dist/ already built
```

Route + content sources: `src/data/catalog.json` (published rows), `src/data/allMeta.ts`
/ `src/data/protocolsMeta.ts` (display names), `src/i18n/locales/en/*` (descriptions),
`src/utils/constants.ts` (`SITE_URL`). v1 is English-only; static `/:lng/` locale routes
are a deferred one-time URL decision.

Because prerendered routes exist as real files, Vercel serves them directly
(filesystem-first) and the `vercel.json` SPA rewrite only kicks in for paths without a
prerendered file — e.g. not-yet-prerendered entries still load the SPA shell. CI runs
the prerenderer after the build and asserts the injected tags on `/erc20` and
`/catalog`.

## Brand Icons

SVG brand icons from [thesvg](https://github.com/glincker/thesvg) are stored in `public/icons/thesvg/` for local use (no CDN dependency):

Ethereum, Solidity, Chainlink, MetaMask, OpenZeppelin, WalletConnect, Trust Wallet, Web3.js, Blockchain.com, BAT, Remix, JWT, Leap Wallet

## License

MIT
