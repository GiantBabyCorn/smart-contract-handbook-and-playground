import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/common/SEOHead';
import { cn } from '@/utils/cn';

export default function NotFoundPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={t('notFound.title')}
        description={t('notFound.description')}
      />

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        {/* Large 404 */}
        <div aria-hidden="true" className="relative select-none">
          {/* eslint-disable react/jsx-no-literals -- "404" is a numeral, identical in every locale */}
          <span
            className={cn(
              'text-[120px] sm:text-[180px] font-black leading-none',
              'text-[var(--erc-color-bg-tertiary)]',
            )}
          >
            404
          </span>
          {/* eslint-enable react/jsx-no-literals */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              className="w-20 h-20"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--erc-color-text-primary)]">
            {t('notFound.title')}
          </h1>
          <p className="text-base text-[var(--erc-color-text-secondary)] leading-relaxed">
            {t('notFound.description')}
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/"
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-6 py-3',
            'bg-[var(--erc-color-accent)] text-white font-semibold',
            'hover:bg-[var(--erc-color-accent-hover)]',
            'transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-offset-2',
            'focus-visible:ring-offset-[var(--erc-color-bg-primary)] focus:outline-none',
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          {t('notFound.goHome')}
        </Link>
      </div>
    </>
  );
}
