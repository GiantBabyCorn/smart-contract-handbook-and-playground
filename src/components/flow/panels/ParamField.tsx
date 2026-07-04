import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SimulationParam } from '@/data/types';
import { cn } from '@/utils/cn';
import {
  ethToWei,
  weiToEth,
  formatThousands,
  stripFormatting,
  isDigits,
  validateParam,
} from '@/features/simulation/units';

const inputClasses = cn(
  'w-full rounded-md text-xs px-2 py-1.5',
  'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
  'text-[var(--erc-color-text-primary)]',
  'font-mono outline-none',
  'focus:border-[var(--erc-color-accent)] focus:ring-1 focus:ring-[var(--erc-color-accent)]',
);

const invalidInputClasses = cn(
  'border-[var(--erc-color-error)]',
  'focus:border-[var(--erc-color-error)] focus:ring-[var(--erc-color-error)]',
);

type Unit = 'wei' | 'eth';

/** Parse a display draft into a canonical wei digit string, or null if invalid. */
function parseDraft(draft: string, unit: Unit): string | null {
  const clean = stripFormatting(draft);
  if (unit === 'wei') {
    return isDigits(clean) && clean.length <= 78 ? clean : null;
  }
  if (!/^(\d+(\.\d{0,18})?|\.\d{1,18})$/.test(clean)) return null;
  return ethToWei(clean);
}

/** Format a stored wei value for display in the given unit (raw passthrough when non-numeric). */
function toDisplay(value: string, unit: Unit): string {
  const clean = stripFormatting(value);
  if (!isDigits(clean)) return value;
  return unit === 'wei'
    ? formatThousands(clean)
    : formatThousands(weiToEth(clean));
}

/** Small circular-arrow "reset to default" button shown next to each field label. */
function ResetButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-0.5 text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-accent)] transition-colors shrink-0"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6a4 4 0 1 1 1.2 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </button>
  );
}

/**
 * ParamField — one simulation parameter input.
 *
 * - address: accepts a full 0x…40-hex address or the demo aliases used by the
 *   entry data ('0xAlice', '0xTokenA,0xTokenB'), with an inline error otherwise.
 * - uint256: digits only, thousand-separated display and a wei ↔ ETH display
 *   toggle (10^18, BigInt-safe string math — the stored value is always wei).
 * - Invalid input shows an inline error; SimulationPanel blocks Run on it.
 * - Every field has a reset-to-default button.
 */
export default function ParamField({
  param,
  value,
  onChange,
}: {
  param: SimulationParam;
  value: string;
  onChange: (id: string, val: string) => void;
}) {
  const { t } = useTranslation('simulation');
  const fieldId = `sim-param-${param.id}`;
  const errorId = `${fieldId}-error`;

  const [unit, setUnit] = useState<Unit>('wei');
  // While the user is typing, `draft` holds the raw text; when null the
  // displayed value is DERIVED from the stored value + unit (formatted).
  // Blur / unit toggle / reset clear the draft, so no sync effect is needed.
  const [draft, setDraft] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const isUint = param.type === 'uint256';
  const shownUint = draft ?? toDisplay(value, unit);

  const validation = validateParam(param.type, value);
  const showError = !validation.ok && (touched || value !== '');

  const handleReset = () => {
    setTouched(false);
    setDraft(null);
    onChange(param.id, param.defaultValue);
  };

  const handleUintInput = (raw: string) => {
    setTouched(true);
    setDraft(raw);
    const parsed = parseDraft(raw, unit);
    // Valid input commits the canonical wei string; invalid input commits the
    // raw text so validation fails upstream and Run stays blocked.
    onChange(param.id, parsed ?? stripFormatting(raw));
  };

  const handleUnitToggle = (next: Unit) => {
    if (next === unit) return;
    setUnit(next);
    setDraft(null);
  };

  const labelRow = (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-[11px] text-[var(--erc-color-text-secondary)] flex-1 min-w-0 truncate"
      >
        {param.label}
      </label>
      {isUint && (
        <div
          role="group"
          aria-label={t('param.unitToggle')}
          className="flex rounded border border-[var(--erc-color-border)] overflow-hidden shrink-0"
        >
          {(['wei', 'eth'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => handleUnitToggle(u)}
              aria-pressed={unit === u}
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-semibold leading-none transition-colors',
                unit === u
                  ? 'bg-[var(--erc-color-accent)] text-white'
                  : 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-text-primary)]',
              )}
            >
              {u === 'wei' ? t('param.unitWei') : t('param.unitEth')}
            </button>
          ))}
        </div>
      )}
      <ResetButton onClick={handleReset} label={t('param.reset')} />
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      {labelRow}

      {param.type === 'select' && param.options ? (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          className={inputClasses}
        >
          {param.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : param.type === 'bool' ? (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          className={inputClasses}
        >
          <option value="true">{t('param.boolTrue')}</option>
          <option value="false">{t('param.boolFalse')}</option>
        </select>
      ) : isUint ? (
        <input
          id={fieldId}
          type="text"
          inputMode="numeric"
          value={shownUint}
          onChange={(e) => handleUintInput(e.target.value)}
          onBlur={() => setDraft(null)}
          placeholder={toDisplay(param.defaultValue, unit)}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={cn(inputClasses, showError && invalidInputClasses)}
        />
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => {
            setTouched(true);
            onChange(param.id, e.target.value);
          }}
          placeholder={param.defaultValue}
          title={param.type === 'address' ? t('param.invalidAddress') : undefined}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={cn(inputClasses, showError && invalidInputClasses)}
        />
      )}

      {showError && !validation.ok && (
        <p
          id={errorId}
          role="alert"
          className="m-0 text-[10px] leading-snug text-[var(--erc-color-error)]"
        >
          {t(validation.errorKey)}
        </p>
      )}
    </div>
  );
}
