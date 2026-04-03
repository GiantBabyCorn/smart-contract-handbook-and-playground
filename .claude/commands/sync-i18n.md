Synchronize and validate i18n translation files across all locales.

## Steps

1. **Lint i18n keys** for naming convention violations:
   ```bash
   python scripts/lint_i18n_keys.py
   ```

2. **Sync missing translations** across all locales (copies English values as placeholders):
   ```bash
   python scripts/sync_translations.py --fix
   ```

3. **Verify completeness** by re-running the linter:
   ```bash
   python scripts/lint_i18n_keys.py
   ```

4. **Review** the changes to ensure placeholder values make sense and flag any that need human translation.

## Reference
See `docs/I18N_CONVENTIONS.md` for the full i18n rules and key naming patterns.
