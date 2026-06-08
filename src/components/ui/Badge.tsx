// ============================================================
// ⬢ BADGE
// Status badges used on opponent cards and tables.
// Server-safe — no client directive needed.
//
// Variants: active | nemesis | rival | dormant | punching-bag
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────

export type BadgeVariant =
  | 'active'
  | 'nemesis'
  | 'rival'
  | 'dormant'
  | 'punching-bag';

type BadgeProps = {
  variant:    BadgeVariant;
  className?: string;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const BADGE_CONFIG: Record<
  BadgeVariant,
  { label: string; colorClass: string; bgClass: string }
> = {
  'active':      { label: '● Active',       colorClass: 'text-[#0099AA]', bgClass: ''                   },
  'nemesis':     { label: 'Nemesis',         colorClass: 'text-[#CC2222]', bgClass: 'bg-[#FFF0F0]'       },
  'rival':       { label: 'Rival',           colorClass: 'text-[#F0B429]', bgClass: ''                   },
  'dormant':     { label: '○ Dormant',       colorClass: 'text-[#9B9088]', bgClass: ''                   },
  'punching-bag':{ label: 'Punching Bag',    colorClass: 'text-[#22AA44]', bgClass: 'bg-[#F0FFF4]'       },
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Badge({ variant, className = '' }: BadgeProps) {
  const { label, colorClass, bgClass } = BADGE_CONFIG[variant];

  return (
    <span
      style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid currentColor' }}
      className={`
        inline-flex items-center whitespace-nowrap
        text-[9px] font-semibold tracking-[0.1em] uppercase
        px-2 py-0.5
        ${colorClass} ${bgClass} ${className}
      `}
    >
      {label}
    </span>
  );
}