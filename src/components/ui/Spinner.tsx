'use client';

// ============================================================
// ⬢ SPINNER
// Two exports:
//   <Spinner />          — inline, composable, sized
//   <PageSpinner />      — full-screen overlay with message
// ============================================================

import { PiCircleNotch } from 'react-icons/pi';
import type { ReactNode } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

type SpinnerProps = {
  size?:  SpinnerSize;
  color?: string;
  className?: string;
};

type PageSpinnerProps = {
  message?: string;
  subMessage?: string;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
};

// ─── SPINNER ─────────────────────────────────────────────────

export function Spinner({ size = 'md', color = '#1A1A1A', className = '' }: SpinnerProps) {
  const px = SIZE_MAP[size];

  return (
    <PiCircleNotch
      size={px}
      color={color}
      className={`animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── PAGE SPINNER ────────────────────────────────────────────

export function PageSpinner({ message = 'Analysing…', subMessage }: PageSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
                 bg-[#F8F3E8]"
    >
      {/* Animated king icon */}
      <div className="mb-8 flex flex-col items-center gap-6">
        <div
          style={{ border: '1.5px solid #1A1A1A' }}
          className="w-14 h-14 flex items-center justify-center"
        >
          <Spinner size="lg" />
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]"
          >
            {message}
          </p>
          {subMessage && (
            <p
              style={{ fontFamily: "'Spectral', serif" }}
              className="text-[13px] italic text-[#9B9088]"
            >
              {subMessage}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar — pure animation, no real progress */}
      <div
        style={{ border: '1.5px solid #C5C8B5' }}
        className="w-48 h-[3px] overflow-hidden"
      >
        <div
          className="h-full bg-[#1A1A1A] animate-[progress_1.6s_ease-in-out_infinite]"
          style={{
            width: '40%',
            animation: 'pm-progress 1.6s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes pm-progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}