Delete an ERC standard or DeFi protocol entry from the Smart Contract Handbook.

## Arguments
The user provides: --slug <slug>

## Steps

1. **Verify the entry exists** by checking `src/data/allMeta.ts` for the slug.

2. **Run the delete script** to remove all associated files:
   ```bash
   python scripts/delete_entry.py --slug $ARGUMENTS
   ```
   This removes:
   - `src/data/standards/<slug>.ts` or `src/data/protocols/<slug>.ts`
   - `src/i18n/locales/{en,zh-CN,zh-TW,ja,ko,es}/<slug>.json`
   - The entry from `src/data/allMeta.ts`

3. **Remove the namespace** from the `ns` array in `src/i18n/config.ts`.

4. **Clean up references** in other entries' `relatedSlugs` arrays (in both `allMeta.ts` and individual data files).

5. **Validate** the project:
   ```bash
   npx tsc --noEmit
   python scripts/validate_registry.py
   ```
