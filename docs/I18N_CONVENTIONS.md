# I18N Conventions

This document defines the rules every contributor must follow when working with
the ERC Explorer internationalisation (i18n) system. Consistency here keeps the
translation workflow predictable and the codebase easy to audit.

---

## Table of Contents

1. [File Layout](#1-file-layout)
2. [Namespace = Filename Rule](#2-namespace--filename-rule)
3. [Key Naming Convention](#3-key-naming-convention)
4. [Interpolation & Pluralisation](#4-interpolation--pluralisation)
5. [Adding a New Key](#5-adding-a-new-key)
6. [Adding a New Language](#6-adding-a-new-language)
7. [Adding a New Namespace](#7-adding-a-new-namespace)
8. [Quality Rules](#8-quality-rules)

---

## 1. File Layout

```
src/i18n/
├── config.ts                   ← i18next initialisation (single source of truth)
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── home.json
    │   └── simulation.json
    ├── zh-CN/
    │   ├── common.json
    │   ├── home.json
    │   └── simulation.json
    ├── zh-TW/  …
    ├── ja/     …
    ├── ko/     …
    └── es/     …
```

Supported locale codes (BCP 47): `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`.

The fallback language is **`en`**. Every key present in an `en/` file **must**
exist in every other locale directory. Missing keys fall back to English at
runtime, but they must not be left untranslated on purpose.

---

## 2. Namespace = Filename Rule

The i18next namespace is **always identical to the JSON filename** (without the
`.json` extension).

| File | Namespace token |
|------|-----------------|
| `common.json` | `'common'` |
| `home.json` | `'home'` |
| `simulation.json` | `'simulation'` |

### Using namespaces in components

```tsx
// Single namespace
const { t } = useTranslation('home');
t('title')                  // → "ERC Explorer"

// Multiple namespaces — first listed becomes the default
const { t } = useTranslation(['home', 'common']);
t('subtitle')               // resolves in 'home'
t('common:loading')         // explicit namespace prefix
```

The `defaultNS` configured in `config.ts` is `'common'`, so components that
only need common strings can call `useTranslation()` without arguments.

---

## 3. Key Naming Convention

### Pattern

```
<slug>.<section>.<detail>
```

All segments use **lowercase letters and camelCase**. No underscores, no
hyphens, no uppercase-only abbreviations.

| Segment | Description | Example |
|---------|-------------|---------|
| `slug` | Top-level group that mirrors the UI area or feature | `sidebar`, `nav`, `error`, `controls`, `panel` |
| `section` | Sub-group within that area | `categories`, `speed`, `status` |
| `detail` | Leaf label — one translatable string | `noResults`, `switchToDark`, `stepForward` |

Depth beyond three levels is permitted only when the UI hierarchy genuinely
requires it. Avoid nesting purely for organisational tidiness.

### Examples

```jsonc
// common.json
{
  "sidebar": {
    "search": "Search standards & protocols...",   // sidebar.search
    "noResults": "No results found",               // sidebar.noResults
    "categories": {
      "token": "Token Standards",                  // sidebar.categories.token
      "crossChain": "Cross-Chain"                  // sidebar.categories.crossChain
    }
  },
  "nav": {
    "home": "Home",                                // nav.home
    "backToHome": "Back to Home"                   // nav.backToHome
  },
  "theme": {
    "switchToLight": "Switch to light theme",      // theme.switchToLight
    "switchToDark": "Switch to dark theme"         // theme.switchToDark
  },
  "error": {
    "title": "Something went wrong",               // error.title
    "reload": "Reload Page"                        // error.reload
  },
  "loading": "Loading..."                          // loading  (top-level leaf — acceptable for very common, standalone strings)
}
```

```jsonc
// simulation.json
{
  "controls": {
    "play": "Play",                                // simulation:controls.play
    "speed": "Speed",                              // simulation:controls.speed
    "speed.slow": "Slow",                          // simulation:controls.speed.slow  ← dotted key — see §3.1
    "stepForward": "Step Forward"                  // simulation:controls.stepForward
  },
  "panel": {
    "step": "Step {{current}} of {{total}}",       // simulation:panel.step
    "noScenario": "Select a scenario to begin"     // simulation:panel.noScenario
  },
  "status": {
    "idle": "Idle",                                // simulation:status.idle
    "running": "Running"                           // simulation:status.running
  }
}
```

### 3.1 Dotted keys inside a nested object

When a section contains both a standalone label **and** child variants (e.g.
`speed` as a label AND `speed.slow` / `speed.normal` / `speed.fast` as
sub-options), store them as sibling flat keys inside the parent object:

```jsonc
"controls": {
  "speed": "Speed",
  "speed.slow": "Slow",
  "speed.normal": "Normal",
  "speed.fast": "Fast"
}
```

This keeps the JSON structure shallow and avoids the ambiguity of a key that is
simultaneously a string and an object. In TypeScript, retrieve them with the
escaped-dot syntax or use `t('controls.speed\\.slow')`.

---

## 4. Interpolation & Pluralisation

### Variables

Use double-brace `{{variableName}}` syntax. Variable names are camelCase.

```jsonc
"step": "Step {{current}} of {{total}}"
```

```tsx
t('panel.step', { current: 2, total: 5 })  // → "Step 2 of 5"
```

### Pluralisation

For count-dependent strings, use i18next built-in plural suffixes. Define both
the singular and plural forms in every locale:

```jsonc
// en/common.json
{
  "results_one": "{{count}} result",
  "results_other": "{{count}} results"
}
```

```tsx
t('results', { count: 3 })   // → "3 results"
t('results', { count: 1 })   // → "1 result"
```

Do **not** construct plural forms by string concatenation in component code.

---

## 5. Adding a New Key

Follow these steps every time a new translatable string is introduced:

1. **Add the English key first** in the appropriate `en/<namespace>.json` file,
   choosing the correct namespace and following the `slug.section.detail`
   pattern.

2. **Add the same key to every other locale file** in the same PR. Provide a
   proper translation — do not leave `"TODO"`, empty strings, or English
   copy-paste as placeholders. If a translation is not yet available, open a
   follow-up issue and mark the string with `"[UNTRANSLATED] English fallback
   text"` so it is clearly visible in the UI during review.

3. **Use the key in the component** via `useTranslation` — never hard-code
   strings that users will see.

4. **Verify** by switching the browser language to at least one non-English
   locale and confirming the string renders correctly.

### Example

Suppose you are adding a "Copy link" button to the `erc-detail` page:

```jsonc
// src/i18n/locales/en/common.json  (or a new erc-detail.json namespace)
{
  "actions": {
    "copyLink": "Copy link",
    "linkCopied": "Link copied!"
  }
}
```

Then in every other locale:

```jsonc
// zh-CN/common.json
{ "actions": { "copyLink": "复制链接", "linkCopied": "链接已复制！" } }

// zh-TW/common.json
{ "actions": { "copyLink": "複製連結", "linkCopied": "連結已複製！" } }

// ja/common.json
{ "actions": { "copyLink": "リンクをコピー", "linkCopied": "コピーしました！" } }

// ko/common.json
{ "actions": { "copyLink": "링크 복사", "linkCopied": "링크가 복사되었습니다!" } }

// es/common.json
{ "actions": { "copyLink": "Copiar enlace", "linkCopied": "¡Enlace copiado!" } }
```

---

## 6. Adding a New Language

1. Add the BCP 47 locale code to `supportedLngs` in `src/i18n/config.ts`.
2. Create `src/i18n/locales/<code>/` and populate all three namespace files
   (`common.json`, `home.json`, `simulation.json`) with complete translations.
3. Add the language entry to the `LANGUAGES` array in
   `src/components/common/LanguageSwitcher.tsx`.
4. Update `features.multilingualDesc` in every existing locale's `home.json` to
   mention the new language.

---

## 7. Adding a New Namespace

1. Create `src/i18n/locales/<lang>/<namespace>.json` for **every** supported
   language simultaneously.
2. Register the new namespace in the `ns` array in `src/i18n/config.ts`.
3. Use `useTranslation('<namespace>')` (or the `<namespace>:key` prefix form) in
   your components.

---

## 8. Quality Rules

| Rule | Rationale |
|------|-----------|
| All segment names are lowercase + camelCase | Predictable, easy to grep |
| No underscores in key names | Underscore-separated keys are visually similar to snake_case variable names and cause confusion |
| No SCREAMING_CASE | Reserved for environment variables; not appropriate in JSON translation files |
| Never concatenate translated substrings to form a sentence | Word order differs between languages; always use a single key with interpolation variables |
| Keep the JSON tree depth ≤ 3 levels (slug → section → detail) | Deeper nesting is harder to read and increases the chance of structural drift between locales |
| No dynamic key construction at runtime (e.g. `t('category.' + id)`) | Makes static analysis and extraction tooling impossible; use an explicit lookup map instead |
| All files must be valid JSON (no comments, no trailing commas) | JSON spec compliance; use `.jsonc` only if the toolchain explicitly supports it |
