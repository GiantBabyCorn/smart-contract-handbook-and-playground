import type { ERCMeta } from './types';

/**
 * Hand-maintained metadata for the DeFi protocol entries.
 *
 * Protocols have no row in the ERC catalog (src/data/catalog.json), so their
 * list-surface metadata lives here and is merged into the GENERATED
 * src/data/allMeta.ts via `...protocolsMeta` (see scripts/gen_allmeta.py).
 *
 * Maintenance:
 *   - add/remove protocols here (scripts/scaffold_entry.py --type protocol and
 *     scripts/delete_entry.py do this for you), then run
 *     `python scripts/gen_allmeta.py && python scripts/gen_catalog_ns.py`.
 *   - `relatedSlugs` intentionally omitted: meta-level relatedSlugs is not
 *     consumed anywhere — RelatedEntries reads the data-file value.
 */
export const protocolsMeta: ERCMeta[] = [
  {
    slug: 'uniswap-v2',
    name: 'Uniswap V2',
    shortDescription: 'uniswap-v2.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.uniswap.org/contracts/v2/overview',
    sortOrder: 2300,
  },
  {
    slug: 'uniswap-v3',
    name: 'Uniswap V3',
    shortDescription: 'uniswap-v3.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.uniswap.org/contracts/v3/overview',
    sortOrder: 2400,
  },
  {
    slug: 'uniswap-v4',
    name: 'Uniswap V4',
    shortDescription: 'uniswap-v4.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.uniswap.org/contracts/v4/overview',
    sortOrder: 2500,
  },
  {
    slug: 'aave-v3',
    name: 'Aave V3',
    shortDescription: 'aave-v3.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.aave.com/developers/getting-started/readme',
    sortOrder: 2600,
  },
  {
    slug: 'compound-v3',
    name: 'Compound V3',
    shortDescription: 'compound-v3.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.compound.finance/',
    sortOrder: 2700,
  },
  {
    slug: 'maker-dao',
    name: 'MakerDAO (DSS)',
    shortDescription: 'maker-dao.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.makerdao.com/',
    sortOrder: 2800,
  },
  {
    slug: 'chainlink-oracle',
    name: 'Chainlink Oracle',
    shortDescription: 'chainlink-oracle.short',
    category: 'oracle',
    entryType: 'protocol',
    officialUrl: 'https://docs.chain.link/data-feeds',
    sortOrder: 2900,
  },
  {
    slug: 'oneinch-aggregator',
    name: '1inch Aggregator',
    shortDescription: 'oneinch-aggregator.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.1inch.io/docs/aggregation-protocol/introduction',
    sortOrder: 3000,
  },
  {
    slug: 'lido-steth',
    name: 'Lido stETH',
    shortDescription: 'lido-steth.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.lido.fi/',
    sortOrder: 3100,
  },
  {
    slug: 'curve-stableswap',
    name: 'Curve StableSwap',
    shortDescription: 'curve-stableswap.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.curve.fi/',
    sortOrder: 3200,
  },
  {
    slug: 'safe-multisig',
    name: 'Safe Multisig',
    shortDescription: 'safe-multisig.short',
    category: 'governance',
    entryType: 'protocol',
    officialUrl: 'https://docs.safe.global/',
    sortOrder: 3300,
  },
  {
    slug: 'eigenlayer',
    name: 'EigenLayer',
    shortDescription: 'eigenlayer.short',
    category: 'defi',
    entryType: 'protocol',
    officialUrl: 'https://docs.eigenlayer.xyz/',
    sortOrder: 3400,
  },
  {
    slug: 'oz-governor',
    name: 'OpenZeppelin Governor',
    shortDescription: 'oz-governor.short',
    category: 'governance',
    entryType: 'protocol',
    officialUrl: 'https://docs.openzeppelin.com/contracts/5.x/governance',
    sortOrder: 3500,
  },
];
