import { useTranslation } from 'react-i18next';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { STATUS_OPTIONS, type CatalogFilters as Filters } from './catalogData';

interface CatalogFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

const inputClass = cn(
  'rounded-lg text-sm px-3 py-2',
  'bg-[var(--erc-color-bg-tertiary)]',
  'border border-[var(--erc-color-border)]',
  'text-[var(--erc-color-text-primary)]',
  'placeholder:text-[var(--erc-color-text-muted)]',
  'focus:outline-none focus:border-[var(--erc-color-accent)]',
  'focus:ring-1 focus:ring-[var(--erc-color-accent)]',
  'transition-colors duration-150',
);

/** Text + select filters for the catalog table, bound to ?q=&category=&status=&type=. */
export default function CatalogFilters({ filters, onChange }: CatalogFiltersProps) {
  const { t } = useTranslation('common');

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t('catalogUi.title')}
    >
      <label className="flex-1 min-w-[12rem]">
        <span className="sr-only">{t('catalogUi.searchLabel')}</span>
        <input
          type="search"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder={t('catalogUi.searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          data-testid="catalog-filter-q"
          className={cn(inputClass, 'w-full', '[&::-webkit-search-cancel-button]:hidden')}
        />
      </label>

      <label>
        <span className="sr-only">{t('catalogUi.category')}</span>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          data-testid="catalog-filter-category"
          className={inputClass}
        >
          <option value="">{t('catalogUi.allCategories')}</option>
          {CATEGORY_ORDER.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category] ? t(CATEGORY_LABELS[category]) : category}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">{t('catalogUi.status')}</span>
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          data-testid="catalog-filter-status"
          className={inputClass}
        >
          <option value="">{t('catalogUi.allStatuses')}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">{t('catalogUi.type')}</span>
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          data-testid="catalog-filter-type"
          className={inputClass}
        >
          <option value="">{t('catalogUi.allTypes')}</option>
          <option value="standard">{t('catalogUi.standard')}</option>
          <option value="protocol">{t('catalogUi.protocol')}</option>
        </select>
      </label>
    </div>
  );
}
