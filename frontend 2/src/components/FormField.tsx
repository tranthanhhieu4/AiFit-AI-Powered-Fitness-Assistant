import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-gold focus:outline-none disabled:bg-gold-light/40 disabled:text-muted";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

/** Labeled text input, the form control used across Sign up, Profile and the Admin forms. */
export function TextField({ label, hint, className = "", ...props }: TextFieldProps) {
  return (
    <label className="block text-sm font-medium text-muted">
      {label}
      <input {...props} className={`${FIELD_CLASS} ${className}`} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, className = "", ...props }: SelectFieldProps) {
  return (
    <label className="block text-sm font-medium text-muted">
      {label}
      <select {...props} className={`${FIELD_CLASS} bg-white ${className}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
