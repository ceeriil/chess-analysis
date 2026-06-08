'use client';

// ============================================================
// ⬢ SELECT
// Styled native <select> — time controls, sort order, filters.
// Native select keeps it accessible + no JS overhead.
// ============================================================

import { PiCaretDown } from 'react-icons/pi';
import type { SelectHTMLAttributes } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type SelectSize = 'sm' | 'md' | 'lg';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?:    string;
  hint?:     string;
  error?:    string;
  size?:     SelectSize;
  options:   SelectOption[];
  placeholder?: string;
};

// ─── STYLE MAPS ──────────────────────────────────────────────

const SIZE_STYLES: Record<SelectSize, string> = {
  sm: 'text-[11px] pl-3 pr-8 py-2',
  md: 'text-[12px] pl-4 pr-9 py-2.5',
  lg: 'text-[13px] pl-4 pr-10 py-3.5',
};

const CARET_SIZE: Record<SelectSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Select({
  label,
  hint,
  error,
  size        = 'md',
  options,
  placeholder,
  className   = '',
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`flex flex-col gap-0 ${className}`}>

      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] mb-2"
        >
          {label}
        </label>
      )}

      {/* Select wrapper */}
      <div className="relative">
        <select
          id={selectId}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            border: error ? '1.5px solid #CC2222' : '1.5px solid #1A1A1A',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
          className={`
            w-full bg-[#F8F3E8] font-medium text-[#1A1A1A]
            cursor-pointer outline-none
            focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${SIZE_STYLES[size]}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Caret */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9088]">
          <PiCaretDown size={CARET_SIZE[size]} />
        </span>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#CC2222] mt-1.5"
        >
          {error}
        </p>
      )}

      {/* Hint */}
      {!error && hint && (
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#9B9088] mt-1.5"
        >
          {hint}
        </p>
      )}
    </div>
  );
}