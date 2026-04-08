import type { SimulationParam } from '@/data/types';
import { cn } from '@/utils/cn';

const inputClasses = cn(
  'w-full rounded-md text-xs px-2 py-1.5',
  'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
  'text-[var(--erc-color-text-primary)]',
  'font-mono outline-none',
  'focus:border-[var(--erc-color-accent)] focus:ring-1 focus:ring-[var(--erc-color-accent)]',
);

export default function ParamField({
  param,
  value,
  onChange,
}: {
  param: SimulationParam;
  value: string;
  onChange: (id: string, val: string) => void;
}) {
  const fieldId = `sim-param-${param.id}`;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="text-[11px] text-[var(--erc-color-text-secondary)]"
      >
        {param.label}
      </label>

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
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          placeholder={param.defaultValue}
          className={inputClasses}
        />
      )}
    </div>
  );
}
