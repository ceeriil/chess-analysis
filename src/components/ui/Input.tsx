'use client';

// ============================================================
// ⬢ INPUT
// Reusable text input matching the design system.
// Supports: label, hint, error, icon left/right, sizes
// ============================================================

import type { InputHTMLAttributes, ReactNode } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?:     string;
  hint?:      string;
  error?:     string;
  size?:      InputSize;
  iconLeft?:  ReactNode;
  iconRight?: ReactNode;
};

// ─── STYLE MAPS ──────────────────────────────────────────────

const SIZE_STYLES: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: 'text-[12px] px-3 py-2',   icon: 'px-2.5' },
  md: { input: 'text-[13px] px-4 py-3',   icon: 'px-3'   },
  lg: { input: 'text-[14px] px-4 py-3.5', icon: 'px-3.5' },
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Input({
  label,
  hint,
  error,
  size      = 'md',
  iconLeft,
  iconRight,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
  const s       = SIZE_STYLES[size];

  return (
    <div className={`flex flex-col gap-0 ${className}`}>

      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] mb-2"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div
        style={{
          border: error ? '1.5px solid #CC2222' : '1.5px solid #1A1A1A',
        }}
        className="flex items-center bg-[#F8F3E8] transition-colors duration-150
                   focus-within:ring-2 focus-within:ring-[#1A1A1A] focus-within:ring-offset-0"
      >
        {/* Icon left */}
        {iconLeft && (
          <span className={`shrink-0 text-[#9B9088] ${s.icon}`}>
            {iconLeft}
          </span>
        )}

        {/* Input */}
        <input
          id={inputId}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className={`
            flex-1 min-w-0 bg-transparent border-none outline-none
            font-medium text-[#1A1A1A]
            placeholder:text-[#9B9088] placeholder:font-normal
            disabled:opacity-50 disabled:cursor-not-allowed
            ${s.input}
          `}
          {...rest}
        />

        {/* Icon right */}
        {iconRight && (
          <span className={`shrink-0 text-[#9B9088] ${s.icon}`}>
            {iconRight}
          </span>
        )}
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