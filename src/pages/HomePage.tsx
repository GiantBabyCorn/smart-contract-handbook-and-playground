import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import SEOHead from '@/components/common/SEOHead';
import { allMeta } from '@/data/allMeta';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ---------------------------------------------------------------------------
// Feature cards data (i18n keys)
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    key: 'visualization',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M17.5 17.5L21 21" />
        <circle cx="17.5" cy="14.5" r="3" />
      </svg>
    ),
    colorClass: 'from-[var(--erc-color-accent)]/20 to-[var(--erc-color-accent)]/5',
    iconBg: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  },
  {
    key: 'simulation',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    colorClass: 'from-[var(--erc-color-success)]/20 to-[var(--erc-color-success)]/5',
    iconBg: 'bg-[var(--erc-color-success)]/15 text-[var(--erc-color-success)]',
  },
  {
    key: 'multilingual',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    colorClass: 'from-[var(--erc-color-warning)]/20 to-[var(--erc-color-warning)]/5',
    iconBg: 'bg-[var(--erc-color-warning)]/15 text-[var(--erc-color-warning)]',
  },
] as const;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const standardCount = allMeta.filter((m) => m.entryType === 'standard').length;
const protocolCount = allMeta.filter((m) => m.entryType === 'protocol').length;

const STATS = [
  {
    value: `${standardCount}`,
    labelKey: 'stats.standards',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      </svg>
    ),
  },
  {
    value: `${protocolCount}`,
    labelKey: 'stats.protocols',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    value: `${allMeta.length}`,
    labelKey: 'stats.simulations',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

// First entry to link to
const firstEntry = allMeta[0];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <>
      <SEOHead
        title={t('title')}
        description={t('description')}
      />

      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center px-6 pt-16 pb-10 sm:pt-24 sm:pb-14">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 max-w-3xl w-full"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5',
                'text-xs font-semibold uppercase tracking-widest',
                'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
                'border border-[var(--erc-color-accent)]/25',
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--erc-color-accent)] animate-pulse" aria-hidden="true" />
                ERC Explorer
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight',
                'text-[var(--erc-color-text-primary)]',
              )}
            >
              {t('subtitle')}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl text-[var(--erc-color-text-secondary)] leading-relaxed max-w-2xl"
            >
              {t('description')}
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }} className="mt-2">
              <Link
                to={`/${firstEntry.slug}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-7 py-3.5',
                  'bg-[var(--erc-color-accent)] text-white text-base font-semibold',
                  'hover:bg-[var(--erc-color-accent-hover)]',
                  'shadow-lg shadow-[var(--erc-color-accent)]/25',
                  'transition-all duration-150 hover:shadow-[var(--erc-color-accent)]/40',
                  'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--erc-color-bg-primary)] focus:outline-none',
                )}
              >
                {t('getStarted')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <section
          aria-label="Statistics"
          className="px-6 pb-10 max-w-4xl mx-auto w-full"
        >
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.labelKey}
                variants={fadeInUp}
                transition={{ duration: 0.45 }}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl p-4 sm:p-6',
                  'border border-[var(--erc-color-border)]',
                  'bg-[var(--erc-color-bg-secondary)]',
                )}
              >
                <span className="text-[var(--erc-color-accent)]" aria-hidden="true">
                  {stat.icon}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[var(--erc-color-text-primary)]">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-[var(--erc-color-text-muted)] text-center leading-snug">
                  {t(stat.labelKey)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Feature cards ────────────────────────────────────────── */}
        <section
          aria-labelledby="features-heading"
          className="px-6 pb-16 max-w-5xl mx-auto w-full"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id="features-heading"
            className="text-xl sm:text-2xl font-bold text-[var(--erc-color-text-primary)] text-center mb-8"
          >
            Everything you need to understand Ethereum standards
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.key}
                variants={fadeInUp}
                transition={{ duration: 0.45 }}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl p-6',
                  'border border-[var(--erc-color-border)]',
                  'bg-gradient-to-br',
                  feature.colorClass,
                  'bg-[var(--erc-color-bg-secondary)]',
                  'hover:border-[var(--erc-color-accent)]/40',
                  'transition-colors duration-200',
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center',
                    feature.iconBg,
                  )}
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-[var(--erc-color-text-primary)]">
                    {t(`features.${feature.key}`)}
                  </h3>
                  <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed">
                    {t(`features.${feature.key}Desc`)}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ── Category quick links ──────────────────────────────── */}
        <section
          aria-labelledby="explore-heading"
          className="px-6 pb-16 max-w-5xl mx-auto w-full"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id="explore-heading"
            className="text-xl sm:text-2xl font-bold text-[var(--erc-color-text-primary)] text-center mb-8"
          >
            Explore by standard
          </motion.h2>

          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            aria-label="Standards and protocols"
          >
            {allMeta
              .filter((m) => m.entryType === 'standard')
              .slice(0, 12)
              .map((item) => (
                <motion.li key={item.slug} variants={fadeInUp} transition={{ duration: 0.35 }}>
                  <Link
                    to={`/${item.slug}`}
                    className={cn(
                      'flex flex-col gap-1.5 rounded-xl p-4',
                      'border border-[var(--erc-color-border)]',
                      'bg-[var(--erc-color-bg-secondary)]',
                      'hover:border-[var(--erc-color-accent)]/40',
                      'hover:bg-[var(--erc-color-bg-tertiary)]',
                      'transition-all duration-150',
                      'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
                    )}
                  >
                    <span className="text-sm font-semibold text-[var(--erc-color-text-primary)] truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-[var(--erc-color-text-muted)] capitalize">
                      {item.category}
                    </span>
                  </Link>
                </motion.li>
              ))}
          </motion.ul>
        </section>
      </div>
    </>
  );
}
