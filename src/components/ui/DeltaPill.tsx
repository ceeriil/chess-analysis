// ============================================================
// ⬢ DELTA PILL
// ELO change indicator. Server-safe.
//
// Usage:
//   <DeltaPill value={+212} />         
//   <DeltaPill value={-68} label="-68 this week" />
//   <DeltaPill value={0} />
// ============================================================


type DeltaDir = 'up' | 'down' | 'flat';

type DeltaPillProps = {
  value:      number;
  label?:     string;       
  className?: string;
};


const DIR_STYLES: Record<DeltaDir, string> = {
  up:   'text-[#22AA44] border-[#22AA44]',
  down: 'text-[#CC2222] border-[#CC2222]',
  flat: 'text-[#9B9088] border-[#9B9088]',
};

// ─── HELPERS ─────────────────────────────────────────────────

function getDir(value: number): DeltaDir {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

function formatValue(value: number): string {
  if (value > 0) return `+${value}`;
  if (value === 0) return '±0';
  return `${value}`;
}

// ─── COMPONENT ───────────────────────────────────────────────

export function DeltaPill({ value, label, className = '' }: DeltaPillProps) {
  const dir         = getDir(value);
  const displayText = label ?? formatValue(value);

  return (
    <span
      style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid currentColor' }}
      className={`
        inline-flex items-center whitespace-nowrap
        text-[10px] font-semibold
        px-2 py-0.5
        ${DIR_STYLES[dir]} ${className}
      `}
    >
      {displayText}
    </span>
  );
}