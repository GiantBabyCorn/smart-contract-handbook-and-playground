import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LABELS } from '@/utils/constants';
import { prefetchEntry } from '@/data/registry';
import { cn } from '@/utils/cn';
import StatusBadge from './StatusBadge';
import type { CatalogRow, SortKey, SortDir } from './catalogData';

interface CatalogTableProps {
  rows: CatalogRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

interface ColumnDef {
  key: SortKey | 'availability';
  labelKey: string;
  sortable: boolean;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'eip', labelKey: 'catalogUi.eip', sortable: true, className: 'w-24' },
  { key: 'name', labelKey: 'catalogUi.name', sortable: true },
  { key: 'category', labelKey: 'catalogUi.category', sortable: true },
  { key: 'status', labelKey: 'catalogUi.status', sortable: true },
  { key: 'tier', labelKey: 'catalogUi.tier', sortable: true, className: 'w-16' },
  { key: 'availability', labelKey: 'catalogUi.availability', sortable: false },
];

/** Semantic, keyboard-operable catalog table (no virtualization — plan G7). */
export default function CatalogTable({ rows, sortKey, sortDir, onSort }: CatalogTableProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--erc-color-border)]">
      <table className="w-full text-sm border-collapse" data-testid="catalog-table">
        <caption className="sr-only">{t('catalogUi.description')}</caption>
        <thead>
          <tr className="bg-[var(--erc-color-bg-secondary)] text-left">
            {COLUMNS.map((column) => {
              const isSorted = column.sortable && column.key === sortKey;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    'border-b border-[var(--erc-color-border)]',
                    'text-xs font-semibold uppercase tracking-wide',
                    'text-[var(--erc-color-text-muted)]',
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key as SortKey)}
                      className={cn(
                        'flex w-full items-center gap-1 px-3 py-2.5 uppercase tracking-wide',
                        'hover:text-[var(--erc-color-text-primary)] transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-inset',
                        isSorted && 'text-[var(--erc-color-text-primary)]',
                      )}
                    >
                      {t(column.labelKey)}
                      <span aria-hidden="true" className="text-[10px]">
                        {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  ) : (
                    <span className="block px-3 py-2.5">{t(column.labelKey)}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-3 py-8 text-center text-[var(--erc-color-text-muted)]"
              >
                {t('catalogUi.noMatches')}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.slug}
                data-slug={row.slug}
                onClick={() => navigate(`/${row.slug}`)}
                onMouseEnter={() => prefetchEntry(row.slug)}
                className={cn(
                  'cursor-pointer border-b border-[var(--erc-color-border)] last:border-b-0',
                  'hover:bg-[var(--erc-color-bg-tertiary)] transition-colors duration-100',
                )}
              >
                <td className="px-3 py-2.5 tabular-nums text-[var(--erc-color-text-secondary)]">
                  {row.eip ?? <span aria-hidden="true">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    to={`/${row.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => prefetchEntry(row.slug)}
                    className={cn(
                      'inline-flex items-center gap-2 font-medium',
                      'text-[var(--erc-color-text-primary)]',
                      'hover:text-[var(--erc-color-accent)] transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] rounded',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'shrink-0 w-1.5 h-1.5 rounded-full',
                        row.entryType === 'standard'
                          ? 'bg-[var(--erc-color-accent)]'
                          : 'bg-[var(--erc-color-category-defi)]',
                      )}
                    />
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-[var(--erc-color-text-secondary)]">
                  {CATEGORY_LABELS[row.category] ? t(CATEGORY_LABELS[row.category]) : row.category}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={row.status} unofficial={row.unofficial} />
                </td>
                <td className="px-3 py-2.5 text-[var(--erc-color-text-secondary)]">
                  {row.tier ?? <span aria-hidden="true">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[var(--erc-color-text-secondary)]">
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-[var(--erc-color-success)]"
                    />
                    {t('catalogUi.live')}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
