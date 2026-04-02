import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Language map
// ---------------------------------------------------------------------------

const LANGUAGES: { code: string; label: string; nativeLabel: string }[] = [
  { code: 'en',    label: 'English',            nativeLabel: 'English'   },
  { code: 'zh-CN', label: 'Simplified Chinese',  nativeLabel: '简体中文'  },
  { code: 'zh-TW', label: 'Traditional Chinese', nativeLabel: '繁體中文'  },
  { code: 'ja',    label: 'Japanese',             nativeLabel: '日本語'    },
  { code: 'ko',    label: 'Korean',               nativeLabel: '한국어'    },
  { code: 'es',    label: 'Spanish',              nativeLabel: 'Español'   },
];

// ---------------------------------------------------------------------------
// GlobeIcon
// ---------------------------------------------------------------------------

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dropdown select that switches the active i18next language.
 *
 * - Reads the active language from `i18n.language`.
 * - Writes via `i18n.changeLanguage()`.
 * - Provides a descriptive `aria-label` for screen-reader users.
 * - Styled with Tailwind utility classes and CSS custom properties from the
 *   ERC Explorer design system (`--erc-color-*`).
 */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');

  // i18next may report e.g. "zh-CN" or "zh" – normalise to a supported code.
  const currentCode =
    LANGUAGES.find((l) => l.code === i18n.language)?.code ??
    LANGUAGES.find((l) => i18n.language.startsWith(l.code.split('-')[0]))?.code ??
    'en';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* Decorative globe icon */}
      <span
        className="pointer-events-none text-[var(--erc-color-text-secondary)]"
        aria-hidden="true"
      >
        <GlobeIcon />
      </span>

      <select
        value={currentCode}
        onChange={handleChange}
        aria-label={t('language.label')}
        className={[
          'appearance-none cursor-pointer',
          'text-sm font-medium leading-tight',
          'py-1.5 pl-2 pr-6',
          'rounded-lg border',
          'bg-transparent',
          'text-[var(--erc-color-text-primary)]',
          'border-[var(--erc-color-border)]',
          'hover:border-[var(--erc-color-accent)]',
          'hover:bg-[var(--erc-color-bg-secondary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--erc-color-accent)] focus:ring-offset-1',
          'focus:ring-offset-[var(--erc-color-bg-primary)]',
          'transition-colors duration-150',
        ].join(' ')}
      >
        {LANGUAGES.map(({ code, label, nativeLabel }) => (
          <option key={code} value={code} lang={code}>
            {nativeLabel}
            {nativeLabel !== label ? ` — ${label}` : ''}
          </option>
        ))}
      </select>

      {/* Custom chevron arrow */}
      <span
        className="pointer-events-none absolute right-2 text-[var(--erc-color-text-secondary)]"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
