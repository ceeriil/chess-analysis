// ============================================================
// ⬢ NEMESIS PANEL
// Inverted dark panel — the emotional centrepiece of the page
// Design rule: Gamification / high-stakes info = inverted dark
// ============================================================

// ─── DATA ────────────────────────────────────────────────────

const NEMESIS_STATS = [
  { label: 'Their ELO',     value: '1,892',    variant: 'default' },
  { label: 'Your Record',   value: '0–7',      variant: 'red'     },
  { label: 'Active Streak', value: 'L7',       variant: 'gold'    },
  { label: 'First Loss',    value: 'Jan 2022', variant: 'small'   },
] as const;

// ─── COMPONENT ───────────────────────────────────────────────

export function NemesisPanel() {
  return (
    <section
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="bg-[#1A1A1A] text-[#F8F3E8]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-0">

        {/* ── Left: Identity ── */}
        <div
          style={{ borderRight: '0px' }}
          className="px-7 py-10 lg:py-12 lg:[border-right:1.5px_solid_#3a3530] flex flex-col justify-between"
        >
          <div>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#9B9088] mb-4"
            >
              Sample — Your Nemesis
            </p>
            <h2
              style={{
                fontFamily:    "'Playfair Display', serif",
                lineHeight:    '0.92',
                letterSpacing: '-0.02em',
              }}
              className="text-[52px] lg:text-[60px] font-black text-[#F8F3E8] mb-5"
            >
              Silent<br />
              <em className="italic text-[#9B9088]">Destroyer</em>
            </h2>
            <p
              style={{ fontFamily: "'Spectral', serif" }}
              className="text-[13px] italic text-[#9B9088] leading-[1.7]"
            >
              7 games played.<br />
              0 wins for you.<br />
              Still active. Still waiting.
            </p>
          </div>

          {/* Nemesis badge */}
          <div className="mt-8">
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                border:     '1.5px solid #CC2222',
              }}
              className="inline-flex text-[10px] font-semibold tracking-[0.12em] uppercase
                         text-[#CC2222] px-3 py-1.5"
            >
              ⬛ Nemesis Classification
            </span>
          </div>
        </div>

        {/* ── Right: Stats ── */}
        <div className="px-7 py-10 lg:py-12 flex flex-col justify-center gap-8">

          {/* Stat grid */}
          <div
            style={{ border: '1.5px solid #3a3530' }}
            className="grid grid-cols-2 lg:grid-cols-4"
          >
            {NEMESIS_STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  borderRight:  i === 1 || i === 3 ? 'none' : '1.5px solid #3a3530',
                  borderBottom: i < 2               ? '1.5px solid #3a3530' : 'none',
                }}
                className="p-4 lg:p-5 lg:[border-bottom:none!important]
                           [&:nth-child(1)]:lg:[border-right:1.5px_solid_#3a3530]
                           [&:nth-child(2)]:lg:[border-right:1.5px_solid_#3a3530]
                           [&:nth-child(3)]:lg:[border-right:1.5px_solid_#3a3530]
                           [&:nth-child(4)]:lg:border-r-0"
              >
                <p
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9B9088] mb-2"
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: '1',
                    fontSize:   stat.variant === 'small' ? '20px' : '30px',
                  }}
                  className={`font-black
                    ${stat.variant === 'red'     ? 'text-[#CC2222]' : ''}
                    ${stat.variant === 'gold'    ? 'text-[#F0B429]' : ''}
                    ${stat.variant === 'default' ? 'text-[#F8F3E8]' : ''}
                    ${stat.variant === 'small'   ? 'text-[#F8F3E8]' : ''}
                  `}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Flavour text */}
          <p
            style={{ fontFamily: "'Spectral', serif" }}
            className="text-[13px] italic text-[#9B9088] leading-[1.65]"
          >
            Nemesis status is assigned when an opponent has beaten you 3 or more times
            with a win rate above 70% against you. They are sorted by active streak length
            and recency. You'll want to know these people.
          </p>
        </div>
      </div>
    </section>
  );
}