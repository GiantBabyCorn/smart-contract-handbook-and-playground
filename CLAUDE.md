# Smart Contract Handbook

Interactive ERC standards & DeFi protocol explorer with flow diagrams and step-by-step simulations.

## Tech Stack

- **Framework**: Vite 8 + React 19 + TypeScript 5.9
- **Styling**: TailwindCSS 4
- **Flow Diagrams**: React Flow (`@xyflow/react`) + ELK.js auto-layout
- **i18n**: i18next with 6 locales (en, zh-CN, zh-TW, ja, ko, es)
- **State**: Zustand
- **Routing**: React Router v7
- **Testing**: Vitest (unit) + Playwright (E2E)

## Directory Structure

```
src/
├── components/
│   ├── common/        # Shared UI (SEOHead, ExternalLink, etc.)
│   ├── flow/          # React Flow canvas, custom nodes & edges
│   │   ├── nodes/     # ContractNode, FunctionNode, UserNode, ProxyNode, StorageNode, TokenFlowNode
│   │   └── edges/     # AnimatedEdge, LabeledEdge, FundFlowEdge
│   └── ...
├── data/
│   ├── types.ts       # Core interfaces: StandardEntry, ProtocolEntry, ERCEntry
│   ├── allMeta.ts     # Registry of all entries (ERCMeta[])
│   ├── standards/     # Standard entry data files (erc20.ts, erc721.ts, ...)
│   └── protocols/     # Protocol entry data files (uniswap-v2.ts, aave-v3.ts, ...)
├── i18n/
│   ├── config.ts      # i18next initialization
│   └── locales/       # {en,zh-CN,zh-TW,ja,ko,es}/{namespace}.json
├── pages/             # Route pages (HomePage, DetailPage, etc.)
├── styles/            # Global CSS and overrides
└── utils/             # Constants, helpers
scripts/               # Python automation scripts
docs/                  # ADRs, I18N conventions, changelog
e2e/                   # Playwright E2E tests
public/                # Static assets (logo, favicon, og images)
```

## Entry Data Model

Each entry is either a `StandardEntry` (ERC standard with `eipNumber`) or `ProtocolEntry` (DeFi protocol with optional `contracts` array). Both extend `BaseEntry` which includes:

- **ERCMeta**: slug, name, category, officialUrl, relatedSlugs, sortOrder
- **ERCContent**: introduction, designPurpose, commonUsage, functions[]
- **ERCFlow**: flowNodes[], flowEdges[], elkLayoutOptions
- **ERCSimulation**: simulations[] with params and steps

All user-visible strings are i18n keys (e.g., `erc20.fn.transfer.desc`).

### Categories
token, nft, proxy, defi, account, utility, identity, oracle, governance, cross-chain, rwa

### Flow Node Types
contract, function, user, proxy, storage, tokenFlow

### Flow Edge Types
animated, labeled, fundFlow

## i18n Conventions

See `docs/I18N_CONVENTIONS.md` for full rules. Key points:
- Namespace = JSON filename (e.g., `erc20` namespace → `locales/{lang}/erc20.json`)
- Key pattern: `slug.section.detail` (e.g., `erc20.fn.transfer.desc`)
- Max 3 nesting levels, no underscores (except `_one`/`_other` plurals)
- Every key in `en/` must exist in all 6 locales
- Fallback language: English

## Common Commands

```bash
# Development
npm run dev           # Start dev server (localhost:5173)
npm run build         # Type check + production build
npm run lint          # ESLint
npm run format        # Prettier

# Testing
npm test              # Vitest unit tests
npm run e2e           # Playwright E2E tests

# Automation scripts
python scripts/scaffold_entry.py --slug <slug> --name "<Name>" --category <cat> --type <standard|protocol> [--eip <n>]
python scripts/delete_entry.py --slug <slug>
python scripts/validate_registry.py
python scripts/lint_i18n_keys.py
python scripts/sync_translations.py [--fix]
python scripts/generate_og_images.py
```

## Common Operations

### Add a new entry
Use `/add-entry` command or run `python scripts/scaffold_entry.py` directly. Then fill in the data file and i18n translations.

### Delete an entry
Use `/delete-entry` command or run `python scripts/delete_entry.py --slug <slug>`. This removes the data file, all i18n locale files, and the allMeta.ts registry entry.

### Sync i18n translations
Use `/sync-i18n` command or run `python scripts/sync_translations.py --fix` to find and fill missing translation keys across locales.

### Validate the project
Run `python scripts/validate_registry.py` to check data file integrity, i18n completeness, and flow edge consistency.
