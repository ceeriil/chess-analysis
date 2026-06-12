// ============================================================
// ⬢ OPPONENTS STATS BAR
// Summary strip at the top of the opponents page.
// Shows: total unique opponents, total losses, nemesis count,
// worst win rate, most games opponent, revenge count.
// Server-safe — pure props.
// ============================================================

import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type OpponentsStatsBarProps = {
  all: OpponentSummary[];
};

type StatCellProps = {
  label:   string;
  value:   string;
  sub?:    string;
  color?:  string;
  isLast?: boolean;
};

// ─── SUB-COMPONENT ───────────────────────────────────────────

function StatCell({ label, value, sub, color = '#1A1A1A', isLast }: StatCellProps) {
  return (
    <div
      style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
      className="flex flex-col gap-1 px-5 py-4 min-w-0"
    >
      <p
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] whitespace-nowrap"
      >
        {label}
      </p>
      <p
        style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1', color }}
        className="text-[26px] font-black"
      >
        {value}
      </p>
      {sub && (
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] text-[#9B9088] truncate"
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────

export function OpponentsStatsBar({ all }: OpponentsStatsBarProps) {
  if (all.length === 0) return null;

  const nemesisCount    = all.filter((o) => o.badge === 'nemesis').length;
  const rivalCount      = all.filter((o) => o.badge === 'rival').length;

  // Opponent you've lost to most
  const mostLossesOpp   = [...all].sort((a, b) => b.losses - a.losses)[0];

  // Total losses across all opponents
  const totalLosses     = all.reduce((sum, o) => sum + o.losses, 0);

  // Opponent with most games
  const mostGamesOpp    = [...all].sort((a, b) => b.totalGames - a.totalGames)[0];

  // Worst win rate (min games 3 to qualify)
  const worstWinRate    = [...all]
    .filter((o) => o.totalGames >= 3)
    .sort((a, b) => a.winRate - b.winRate)[0];

  const stats: StatCellProps[] = [
    {
      label: 'Unique Opponents',
      value: all.length.toLocaleString(),
      sub:   `${rivalCount} rival${rivalCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Total Losses',
      value: totalLosses.toLocaleString(),
      color: '#CC2222',
      sub:   mostLossesOpp
        ? `most: ${mostLossesOpp.losses} to ${mostLossesOpp.username}`
        : undefined,
    },
    {
      label: 'Nemeses',
      value: String(nemesisCount),
      color: nemesisCount > 0 ? '#CC2222' : '#1A1A1A',
      sub:   nemesisCount > 0 ? 'who own you 60%+' : 'none detected',
    },
    {
      label: 'Most Played',
      value: mostGamesOpp ? String(mostGamesOpp.totalGames) : '—',
      sub:   mostGamesOpp?.username,
    },
    {
      label: 'Worst Win Rate',
      value: worstWinRate ? `${worstWinRate.winRate}%` : '—',
      color: '#CC2222',
      sub:   worstWinRate?.username,
      isLast: true,
    },
  ];

  return (
    <div
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-[#F0E8D8]"
    >
      {stats.map((stat) => (
        <StatCell key={stat.label} {...stat} />
      ))}
    </div>
  );
}