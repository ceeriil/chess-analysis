// ============================================================
// ⬢ FEATURE STRIP
// 4 columns, hard borders, numbered
// ============================================================

const FEATURES = [
  {
    num:   '01',
    title: 'Opponent Intelligence',
    desc:  'Full profiles on every player you\'ve faced — ELO history, activity status, time controls they prefer, and when they\'re most dangerous.',
  },
  {
    num:   '02',
    title: 'Nemesis Detection',
    desc:  'Automatically flags recurring opponents who beat you disproportionately. Ranked by total damage inflicted, active streak, and ELO delta at time of each loss.',
  },
  {
    num:   '03',
    title: 'ELO Trajectories',
    desc:  'Your ELO vs theirs plotted over every encounter. See who was stronger when you first met and how the gap has shifted since.',
  },
  {
    num:   '04',
    title: 'Streak Tracking',
    desc:  'Current and all-time win/loss streaks against specific opponents. Know who you\'re hot against — and who has quietly owned you for two years.',
  },
] as const;

// ─── COMPONENT ───────────────────────────────────────────────

export function FeatureStrip() {
  return (
    <section
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#F8F3E8]"
    >
      {FEATURES.map((feat, i) => {
        const isLast = i === FEATURES.length - 1;
        return (
          <div
            key={feat.num}
            style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
            className="px-6 py-7
                       [&:nth-child(2)]:sm:[border-right:1.5px_solid_#1A1A1A]
                       [&:nth-child(3)]:sm:[border-right:none]
                       [&:nth-child(3)]:lg:[border-right:1.5px_solid_#1A1A1A]"
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                lineHeight: '1',
              }}
              className="text-[42px] font-black text-[#C5C8B5] mb-4"
            >
              {feat.num}
            </p>

            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#1A1A1A] mb-3"
            >
              {feat.title}
            </p>

            <p
              style={{ fontFamily: "'Spectral', serif" }}
              className="text-[13px] leading-[1.65] text-[#9B9088]"
            >
              {feat.desc}
            </p>
          </div>
        );
      })}
    </section>
  );
}