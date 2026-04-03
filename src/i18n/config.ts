import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es'],
    ns: [
      'common',
      'home',
      'simulation',
      'aave-v3',
      'chainlink-oracle',
      'compound-v3',
      'curve-stableswap',
      'eigenlayer',
      'erc1155',
      'erc1271',
      'erc165',
      'erc173',
      'erc1822',
      'erc1967',
      'erc20',
      'erc2535',
      'erc2612',
      'erc2981',
      'erc3525',
      'erc3643',
      'erc4337',
      'erc4361',
      'erc4626',
      'erc5267',
      'erc6551',
      'erc6900',
      'erc721',
      'erc7579',
      'erc7683',
      'erc7702',
      'lido-steth',
      'maker-dao',
      'oneinch-aggregator',
      'oz-governor',
      'safe-multisig',
      'uniswap-v2',
      'uniswap-v3',
      'uniswap-v4',
    ],
    defaultNS: 'common',
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
