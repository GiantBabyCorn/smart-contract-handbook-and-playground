import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/common/SEOHead';
import CatalogFilters from './catalog/CatalogFilters';
import CatalogTable from './catalog/CatalogTable';
import {
  catalogRows,
  filterRows,
  sortRows,
  type CatalogFilters as Filters,
  type SortDir,
  type SortKey,
} from './catalog/catalogData';

/**
 * /catalog — the full published catalog as a semantic, filterable, sortable
 * table (plan.md 8.0 G7). Filters live in the query string
 * (?q=&category=&status=&type=) so views are shareable; only published
 * entries render (unpublished skeletons never reach the generated allMeta).
 */
export default function CatalogPage() {
  const { t } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'eip', dir: 'asc' });

  const filters = useMemo<Filters>(
    () => ({
      q: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      status: searchParams.get('status') ?? '',
      type: searchParams.get('type') ?? '',
    }),
    [searchParams],
  );

  const handleFilterChange = useCallback(
    (patch: Partial<Filters>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(patch)) {
            if (value) {
              next.set(key, value);
            } else {
              next.delete(key);
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleSort = useCallback((key: SortKey) => {
    setSort((previous) =>
      previous.key === key
        ? { key, dir: previous.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );
  }, []);

  const visibleRows = useMemo(
    () => sortRows(filterRows(catalogRows, filters), sort.key, sort.dir),
    [filters, sort],
  );

  return (
    <>
      <SEOHead
        title={t('catalogUi.title')}
        description={t('catalogUi.description')}
        slug="catalog"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold text-[var(--erc-color-text-primary)]">
            {t('catalogUi.title')}
          </h1>
          <p className="text-sm text-[var(--erc-color-text-secondary)]">
            {t('catalogUi.description')}
          </p>
        </header>

        <CatalogFilters filters={filters} onChange={handleFilterChange} />

        {/* Row count summary */}
        <p
          className="text-xs text-[var(--erc-color-text-muted)]"
          data-testid="catalog-summary"
          aria-live="polite"
        >
          {t('catalogUi.summary', { shown: visibleRows.length, total: catalogRows.length })}
        </p>

        <CatalogTable
          rows={visibleRows}
          sortKey={sort.key}
          sortDir={sort.dir}
          onSort={handleSort}
        />
      </div>
    </>
  );
}
