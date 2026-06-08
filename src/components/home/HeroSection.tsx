// ============================================================
// ⬢ HERO SECTION
// ============================================================

import { UsernameInput } from './UsernameInput';


type HeroSectionProps = {
  locale: string;
};


const SAMPLE_STATS = [
  {
    label:   'Opponents Tracked',
    value:   '1,847',
    sub:     'across all time controls',
    variant: 'default',
  },
  {
    label:   'Nemeses Detected',
    value:   '14',
    sub:     'opponents who beat you 3+ times',
    variant: 'red',
  },
  {
    label:   'Your Win Rate vs Rivals',
    value:   '38%',
    sub:     `you're losing more than you think`,
    variant: 'green',
  },
  {
    label:   'Longest Losing Streak',
    value:   'L7',
    sub:     'to SilentDestroyer · still active',
    variant: 'gold',
  },
] as const;

// ─── COMPONENT ───────────────────────────────────────────────

export function HeroSection({ locale }: HeroSectionProps) {
  return (
    <section
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="grid grid-cols-1 lg:grid-cols-2 bg-[#F8F3E8]"
    >
      <div
        style={{ borderRight: '0px' }}
        className="px-7 py-12 lg:py-16 lg:pr-10 lg:[border-right:1.5px_solid_#1A1A1A]"
      >
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#9B9088] mb-5"
        >
          Longitudinal Chess Analysis
        </p>

        <h1
          style={{ fontFamily: "'Playfair Display', serif", lineHeight: '0.91', letterSpacing: '-0.02em' }}
          className="text-[64px] sm:text-[80px] font-black text-[#1A1A1A] mb-7"
        >
          Know your<br />
          <em className="italic text-[#9B9088]">enemies.</em>
        </h1>

        <p
          style={{ fontFamily: "'Spectral', serif" }}
          className="text-[15px] leading-[1.75] text-[#3a3530] max-w-[400px] mb-9"
        >
          Enter your Chess.com username and get a full intelligence report
          on every opponent you've ever faced — their ELO trajectory,
          your complete head-to-head record, and exactly who has been
          quietly punishing you for years.
        </p>

        <UsernameInput locale={locale} />

        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#9B9088] mt-3"
        >
          Free · No account required · Chess.com public data only
        </p>
      </div>

      <div className="px-7 py-12 lg:py-16 lg:pl-10 flex flex-col justify-between gap-8">

        <div
          style={{ border: '1.5px solid #1A1A1A' }}
          className="grid grid-cols-2"
        >
          {SAMPLE_STATS.map((stat, i) => {
            const isRightCol   = i % 2 === 1;
            const isBottomRow  = i >= 2;
            return (
              <div
                key={stat.label}
                style={{
                  borderRight:  isRightCol  ? 'none' : '1.5px solid #1A1A1A',
                  borderBottom: isBottomRow ? 'none' : '1.5px solid #1A1A1A',
                }}
                className="p-5"
              >
                <p
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] mb-1.5"
                >
                  {stat.label}
                </p>
                <p
                  style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
                  className={`text-[34px] font-black mb-1
                    ${stat.variant === 'red'   ? 'text-[#CC2222]' : ''}
                    ${stat.variant === 'green' ? 'text-[#22AA44]' : ''}
                    ${stat.variant === 'gold'  ? 'text-[#F0B429]' : ''}
                    ${stat.variant === 'default' ? 'text-[#1A1A1A]' : ''}
                  `}
                >
                  {stat.value}
                </p>
                <p
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[10px] text-[#9B9088]"
                >
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>

        <blockquote
          style={{
            fontFamily: "'Spectral', serif",
            borderLeft:  '2px solid #1A1A1A',
          }}
          className="italic text-[13px] text-[#9B9088] leading-[1.65] pl-4"
        >
          "The first step to fixing a problem is admitting you have one.
          The second step is finding out exactly who is responsible."
        </blockquote>
      </div>
    </section>
  );
}