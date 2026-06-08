'use client';

// ============================================================
// ⬢ BUTTON
// Variants: primary | secondary | ghost | danger
// Sizes:    sm | md | lg
// States:   loading (replaces children with spinner + label)
//           disabled
// ============================================================

import { Spinner } from '@/components/ui/Spinner';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  loading?:      boolean;
  loadingLabel?: string;
  iconLeft?:     ReactNode;
  iconRight?:    ReactNode;
  children:      ReactNode;
};

// ─── STYLE MAPS ──────────────────────────────────────────────

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   `bg-[#1A1A1A] text-[#F8F3E8] border-[#1A1A1A]
              hover:bg-[#CC2222] hover:border-[#CC2222]`,

  secondary: `bg-transparent text-[#1A1A1A] border-[#1A1A1A]
              hover:bg-[#1A1A1A] hover:text-[#F8F3E8]`,

  ghost:     `bg-transparent text-[#9B9088] border-[#C5C8B5]
              hover:text-[#1A1A1A] hover:border-[#1A1A1A]`,

  danger:    `bg-transparent text-[#CC2222] border-[#CC2222]
              hover:bg-[#CC2222] hover:text-[#F8F3E8]`,
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'text-[10px] tracking-[0.12em] px-3.5 py-2 gap-1.5',
  md: 'text-[11px] tracking-[0.12em] px-5 py-2.5 gap-2',
  lg: 'text-[12px] tracking-[0.12em] px-6 py-3.5 gap-2.5',
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary:   '#F8F3E8',
  secondary: '#1A1A1A',
  ghost:     '#9B9088',
  danger:    '#CC2222',
};

const SPINNER_HOVER_COLOR: Record<ButtonVariant, string> = {
  primary:   '#F8F3E8',
  secondary: '#F8F3E8',
  ghost:     '#1A1A1A',
  danger:    '#F8F3E8',
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Button({
  variant      = 'primary',
  size         = 'md',
  loading      = false,
  loadingLabel = 'Loading…',
  iconLeft,
  iconRight,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid' }}
      className={`
        inline-flex items-center justify-center font-semibold uppercase
        transition-colors duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="xs" color={SPINNER_COLOR[variant]} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {iconLeft  && <span className="shrink-0">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}