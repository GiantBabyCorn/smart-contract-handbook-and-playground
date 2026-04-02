Add a new ERC standard or DeFi protocol entry to the Smart Contract Handbook.

## Arguments
The user provides arguments in the format: --slug <slug> --name "<Name>" --category <category> --type <standard|protocol> [--eip <number>]

## Steps

1. **Run the scaffold script** to generate boilerplate files:
   ```bash
   python scripts/scaffold_entry.py $ARGUMENTS
   ```
   This creates:
   - `src/data/standards/<slug>.ts` or `src/data/protocols/<slug>.ts` -- the data file
   - `src/i18n/locales/en/<slug>.json` -- the i18n translation file
   - Appends metadata to `src/data/allMeta.ts`

2. **Fill in the data file** with real content:
   - Read the official specification/documentation for the standard or protocol
   - Populate `functions` array with all key functions, events, and their parameters
   - Design `flowNodes` and `flowEdges` to create a clear interaction flow diagram
   - Create at least 1-2 `simulations` scenarios with step-by-step walkthroughs

3. **Fill in the i18n file** with real English translations:
   - Replace all TODO placeholders with accurate, educational descriptions
   - Add `fn.*` keys for every function, parameter, and return value
   - Add `node.*` and `edge.*` keys for all flow diagram elements
   - Add `sim.*` keys for all simulation scenarios, params, steps, and mobile descriptions

4. **Validate** the new entry:
   ```bash
   npx tsc --noEmit
   python scripts/validate_registry.py
   ```

## Data File Reference
Read `src/data/types.ts` for the full TypeScript interface.
Look at existing entries (e.g. `src/data/standards/erc20.ts`) as a reference for the expected structure.

## Categories
Valid categories: token, nft, proxy, defi, account, utility, identity, oracle, governance, cross-chain, rwa
