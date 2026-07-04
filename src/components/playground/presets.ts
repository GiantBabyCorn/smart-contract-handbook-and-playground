/**
 * One-click demo combos shown in the playground's empty state.
 * `name` is a literal (entry proper nouns are never translated);
 * `descKey` is a common-namespace i18n key for the descriptive part.
 */
export interface PlaygroundPreset {
  id: string;
  name: string;
  descKey: string;
  slugs: string[];
}

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'permit',
    name: 'ERC-20 + ERC-2612',
    descKey: 'playground.presetPermit',
    slugs: ['erc20', 'erc2612'],
  },
  {
    id: 'swap',
    name: 'ERC-20 + Uniswap V2',
    descKey: 'playground.presetSwap',
    slugs: ['erc20', 'uniswap-v2'],
  },
  {
    id: 'royalty',
    name: 'ERC-721 + ERC-2981',
    descKey: 'playground.presetRoyalty',
    slugs: ['erc721', 'erc2981'],
  },
  {
    id: 'aa',
    name: 'ERC-4337 + ERC-7579',
    descKey: 'playground.presetAa',
    slugs: ['erc4337', 'erc7579'],
  },
  {
    id: 'uups',
    name: 'ERC-1967 + ERC-1822',
    descKey: 'playground.presetUups',
    slugs: ['erc1967', 'erc1822'],
  },
];
