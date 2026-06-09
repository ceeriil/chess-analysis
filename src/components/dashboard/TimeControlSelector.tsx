'use client';

// ============================================================
// ⬢ TIME CONTROL SELECTOR
// Pill group — Rapid (default) | Blitz | Bullet | All
// Compact enough to sit inline in page headers.
// ============================================================

import type { TimeControl } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

export type TimeControlOption = TimeControl | 'all';

type TimeControlSelectorProps = {
  value:     TimeControlOption;
  onChange:  (v: TimeControlOption) => void;
  className?: string;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const OPTIONS: { value: TimeControlOption; label: string }[] = [
  { value: 'rapid',  label: 'Rapid'  },
  { value: 'blitz',  label: 'Blitz'  },
  { value: 'bullet', label: 'Bullet' },
  { value: 'all',    label: 'All'    },
];

// ─── COMPONENT ───────────────────────────────────────────────

export function TimeControlSelector({
  value,
  onChange,
  className = '',
}: TimeControlSelectorProps) {
  return (
    <div
      style={{ border: '1.5px solid #1A1A1A' }}
      className={`inline-flex ${className}`}
    >
      {OPTIONS.map((opt, i) => {
        const active  = value === opt.value;
        const isLast  = i === OPTIONS.length - 1;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily:  "'IBM Plex Mono', monospace",
              borderRight: isLast ? 'none' : '1.5px solid #1A1A1A',
            }}
            className={`
              px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase
              transition-colors duration-100 cursor-pointer border-none
              ${active
                ? 'bg-[#1A1A1A] text-[#F8F3E8]'
                : 'bg-transparent text-[#9B9088] hover:text-[#1A1A1A] hover:bg-[#F0E8D8]'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}