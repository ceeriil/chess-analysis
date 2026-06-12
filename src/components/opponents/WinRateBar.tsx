// ============================================================
// ⬢ WIN RATE BAR
// Horizontal stacked bar: wins (green) / draws (gray) / losses (red).
// Shows percentage segments + optional label overlay.
// Server-safe — pure props, no hooks.
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────

type WinRateBarProps = {
  wins:      number;
  draws:     number;
  losses:    number;
  height?:   number;   // px, default 6
  showLabel?: boolean; // show W/D/L counts below bar
  className?: string;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function WinRateBar({
  wins,
  draws,
  losses,
  height    = 6,
  showLabel = false,
  className = '',
}: WinRateBarProps) {
  const total = wins + draws + losses;
  if (total === 0) return null;

  const winPct   = (wins   / total) * 100;
  const drawPct  = (draws  / total) * 100;
  const lossPct  = (losses / total) * 100;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {/* Bar */}
      <div
        className="flex w-full overflow-hidden"
        style={{ height: `${height}px` }}
        role="img"
        aria-label={`${wins} wins, ${draws} draws, ${losses} losses`}
      >
        {winPct > 0 && (
          <div
            style={{ width: `${winPct}%`, background: '#22AA44' }}
            className="shrink-0"
          />
        )}
        {drawPct > 0 && (
          <div
            style={{ width: `${drawPct}%`, background: '#C5C8B5' }}
            className="shrink-0"
          />
        )}
        {lossPct > 0 && (
          <div
            style={{ width: `${lossPct}%`, background: '#CC2222' }}
            className="shrink-0"
          />
        )}
      </div>

      {/* Labels */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] font-semibold text-[#22AA44]"
          >
            {wins}W
          </span>
          {draws > 0 && (
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] text-[#9B9088]"
            >
              {draws}D
            </span>
          )}
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] font-semibold text-[#CC2222]"
          >
            {losses}L
          </span>
        </div>
      )}
    </div>
  );
}