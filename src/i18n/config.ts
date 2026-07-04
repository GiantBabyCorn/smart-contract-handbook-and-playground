import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es'],
    // Only app-shell namespaces are resident; per-entry namespaces are
    // lazy-loaded on demand via resourcesToBackend + useTranslation(slug).
    // 'catalog' is the generated per-locale short-description namespace
    // (scripts/gen_catalog_ns.py) — list surfaces read it instead of loading
    // one namespace per entry.
    ns: ['common', 'home', 'simulation', 'catalog'],
    defaultNS: 'common',
    detection: {
      // querystring (?lng=xx) enables shareable/e2e-testable URLs and wins
      // over the persisted choice; localStorage persists the user's pick.
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

// Keep <html lang> in sync with the active language (a11y / SEO).
if (typeof document !== 'undefined') {
  const syncHtmlLang = (lng: string) => {
    document.documentElement.lang = lng;
  };
  i18n.on('languageChanged', syncHtmlLang);
  // Also set it once for the initial language: language detection resolves
  // asynchronously during init, so cover both possible orderings.
  if (i18n.isInitialized) {
    syncHtmlLang(i18n.language);
  } else {
    i18n.on('initialized', () => syncHtmlLang(i18n.language));
  }
}

export default i18n;
