'use client';

// ============================================================
// ⬢ TOOLTIP
// CSS-only positioning tooltip. No JS positioning lib needed
// for simple cases. Positions: top | bottom | left | right.
//
// Usage:
//   <Tooltip content="Last seen 3 days ago">
//     <Badge variant="dormant" />
//   </Tooltip>
// ============================================================

import type { ReactNode } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content:    ReactNode;
  position?:  TooltipPosition;
  children:   ReactNode;
  className?: string;
};

// ─── STYLE MAPS ──────────────────────────────────────────────

const POSITION_STYLES: Record<TooltipPosition, { tooltip: string; arrow: string }> = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow:   'top-full left-1/2 -translate-x-1/2 border-t-[#1A1A1A] border-x-transparent border-b-transparent border-[5px]',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow:   'bottom-full left-1/2 -translate-x-1/2 border-b-[#1A1A1A] border-x-transparent border-t-transparent border-[5px]',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow:   'left-full top-1/2 -translate-y-1/2 border-l-[#1A1A1A] border-y-transparent border-r-transparent border-[5px]',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow:   'right-full top-1/2 -translate-y-1/2 border-r-[#1A1A1A] border-y-transparent border-l-transparent border-[5px]',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Tooltip({
  content,
  position  = 'top',
  children,
  className = '',
}: TooltipProps) {
  const { tooltip, arrow } = POSITION_STYLES[position];

  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}

      {/* Tooltip box */}
      <span
        role="tooltip"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          border:     '1.5px solid #1A1A1A',
        }}
        className={`
          pointer-events-none absolute z-50 whitespace-nowrap
          bg-[#1A1A1A] text-[#F8F3E8]
          text-[10px] font-medium tracking-[0.06em]
          px-2.5 py-1.5
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          ${tooltip}
        `}
      >
        {content}

        {/* Arrow */}
        <span className={`absolute w-0 h-0 ${arrow}`} aria-hidden="true" />
      </span>
    </span>
  );
}