// ============================================================
// ⬢ HOW IT WORKS
// 3 steps + V2 roadmap teaser
// ============================================================

// ─── DATA ────────────────────────────────────────────────────

const STEPS = [
  {
    num:   'Step 01 —',
    title: 'Enter your username',
    desc:  'We pull your full game history from Chess.com\'s public API. No account required. No OAuth. No email. Just your username and we do the rest.',
    tag:   'Chess.com API',
    tagColor: '#0099AA',
  },
  {
    num:   'Step 02 —',
    title: 'We build your opponent graph',
    desc:  'Every opponent is profiled — their ELO timeline, activity status, and your complete head-to-head history. Nemeses are flagged automatically.',
    tag:   'Opponent Intelligence',
    tagColor: '#0099AA',
  },
  {
    num:   'Step 03 —',
    title: 'Face the truth',
    desc:  'Sorted, ranked, and filterable. Who you dodge, who dodges you, and who has been quietly beating you in the background for two years.',
    tag:   'V1 Now · V2 Coming',
    tagColor: '#9B9088',
  },
] as const;

const ROADMAP = [
  { label: 'V1 — Now',  items: ['Opponent profiles', 'Nemesis detection', 'Head-to-head records', 'ELO timelines', 'Streak tracking'], active: true  },
  { label: 'V2 — Soon', items: ['Your own ELO trajectory', 'Opening weakness analysis', 'Time-of-day performance', 'Win/loss pattern heatmaps', 'Self-improvement reports'], active: false },
] as const;

// ─── COMPONENT ───────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section className="bg-[#F8F3E8]">

      {/* Steps */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="grid grid-cols-1 md:grid-cols-3"
      >
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <div
              key={step.num}
              style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
              className="px-6 py-8 flex flex-col gap-3"
            >
              <p
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-[10px] tracking-[0.14em] text-[#9B9088]"
              >
                {step.num}
              </p>
              <h3
                style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1.2' }}
                className="text-[22px] font-bold text-[#1A1A1A]"
              >
                {step.title}
              </h3>
              <p
                style={{ fontFamily: "'Spectral', serif" }}
                className="text-[13px] leading-[1.65] text-[#9B9088] flex-1"
              >
                {step.desc}
              </p>
              <span
                style={{
                  fontFamily:   "'IBM Plex Mono', monospace",
                  borderBottom: `1.5px solid ${step.tagColor}`,
                  color:        step.tagColor,
                }}
                className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase pb-0.5 w-fit"
              >
                {step.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* Roadmap strip */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        {ROADMAP.map((phase, i) => {
          const isLast = i === ROADMAP.length - 1;
          return (
            <div
              key={phase.label}
              style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
              className={`px-7 py-8 ${!phase.active ? 'bg-[#F0E8D8]' : ''}`}
            >
              <p
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className={`text-[10px] font-semibold tracking-[0.14em] uppercase mb-4
                  ${phase.active ? 'text-[#0099AA]' : 'text-[#9B9088]'}`}
              >
                {phase.label}
              </p>
              <ul className="flex flex-col gap-2">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className={`flex items-center gap-2.5 text-[12px]
                      ${phase.active ? 'text-[#1A1A1A]' : 'text-[#9B9088]'}`}
                  >
                    <span
                      className={`w-4 h-[1.5px] shrink-0 inline-block
                        ${phase.active ? 'bg-[#22AA44]' : 'bg-[#C5C8B5]'}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}