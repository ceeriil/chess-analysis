// ============================================================
// ⬢ STATS STRIP
// 4-column summary stat bar beneath PlayerHeader.
// Server-safe — pure props.
// ============================================================

import type { OpponentSummary, PlayerRating } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type StatsStripProps = {
  rating:       PlayerRating | null;
  opponents:    OpponentSummary[];
  totalGames:   number;
};

type StatCellProps = {
  label:    string;
  value:    string;
  sub?:     string;
  variant?: 'default' | 'red' | 'green' | 'gold';
  isLast?:  boolean;
};

// ─── SUB-COMPONENT ───────────────────────────────────────────

function StatCell({ label, value, sub, variant = 'default', isLast }: StatCellProps) {
  const valueColor = {
    default: 'text-[#1A1A1A]',
    red:     'text-[#CC2222]',
    green:   'text-[#22AA44]',
    gold:    'text-[#F0B429]',
  }[variant];

  return (
    <div
      style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
      className="flex flex-col gap-1 px-5 py-4"
    >
      <p
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088]"
      >
        {label}
      </p>
      <p
        style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
        className={`text-[32px] font-black ${valueColor}`}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] text-[#9B9088]"
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export function StatsStrip({ rating, opponents, totalGames }: StatsStripProps) {
  const nemesisCount  = opponents.filter((o) => o.badge === 'nemesis').length;
  const winRate       = rating?.winRate ?? 0;

  // Worst active streak across all opponents
  const worstStreak   = opponents.reduce((max, o) => {
    if (o.currentStreak.type === 'loss') {
      return Math.max(max, o.currentStreak.count);
    }
    return max;
  }, 0);

  const worstStreakOpp = opponents.find(
    (o) => o.currentStreak.type === 'loss' && o.currentStreak.count === worstStreak,
  );

  const stats: StatCellProps[] = [
    {
      label:   'Games Analysed',
      value:   totalGames.toLocaleString(),
      sub:     'across all time controls',
      variant: 'default',
    },
    {
      label:   'Overall Win Rate',
      value:   `${winRate}%`,
      sub:     `${rating?.wins ?? 0}W · ${rating?.draws ?? 0}D · ${rating?.losses ?? 0}L`,
      variant: winRate >= 50 ? 'green' : winRate >= 40 ? 'default' : 'red',
    },
    {
      label:   'Nemeses',
      value:   String(nemesisCount),
      sub:     nemesisCount > 0 ? 'opponents who own you' : 'none detected yet',
      variant: nemesisCount > 0 ? 'red' : 'default',
    },
    {
      label:   'Active Loss Streak',
      value:   worstStreak > 0 ? `L${worstStreak}` : '—',
      sub:     worstStreakOpp ? `vs ${worstStreakOpp.username}` : 'no active streak',
      variant: worstStreak >= 5 ? 'red' : worstStreak > 0 ? 'gold' : 'default',
      isLast:  true,
    },
  ];

  return (
    <div
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="grid grid-cols-2 lg:grid-cols-4 bg-[#F8F3E8]"
    >
      {stats.map((stat, i) => (
        <StatCell
          key={stat.label}
          {...stat}
          isLast={i === stats.length - 1}
        />
      ))}
    </div>
  );
}