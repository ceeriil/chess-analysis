// ============================================================
// ⬢ RECENT OPPONENTS
// Last 5 opponents by date — compact list for dashboard.
// Links to each opponent's deep-dive page.
// Server-safe — pure props.
// ============================================================

import Link           from 'next/link';
import { Badge }      from '@/components/ui/Badge';
import { DeltaPill }  from '@/components/ui/DeltaPill';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { PiClock, PiCaretRight } from 'react-icons/pi';
import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type RecentOpponentsProps = {
  opponents: OpponentSummary[];
  loading:   boolean;
  username:  string;
  locale:    string;
};

// ─── HELPERS ─────────────────────────────────────────────────

function formatLastPlayed(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── COMPONENT ───────────────────────────────────────────────

export function RecentOpponents({
  opponents,
  loading,
  username,
  locale,
}: RecentOpponentsProps) {
  // Sort by last played, take 5
  const recent = [...opponents]
    .sort((a, b) => b.lastPlayedAt.getTime() - a.lastPlayedAt.getTime())
    .slice(0, 5);

  return (
    <section style={{ borderTop: '1.5px solid #1A1A1A' }}>

      {/* Header */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2.5">
          <PiClock size={14} className="text-[#9B9088]" />
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1A1A1A]"
          >
            Recent Opponents
          </p>
        </div>
        <Link
          href={`/${locale}/${username}/opponents`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em]
                     uppercase text-[#9B9088] hover:text-[#1A1A1A]
                     transition-colors duration-150 no-underline"
        >
          All opponents <PiCaretRight size={11} />
        </Link>
      </div>

      {/* Rows */}
      {loading ? (
        <TableRowSkeleton colCount={5} rows={5} />
      ) : (
        <div>
          {recent.map((opp, i) => {
            const isLast = i === recent.length - 1;
            return (
              <Link
                key={opp.username}
                href={`/${locale}/${username}/opponents/${opp.username}`}
                style={{ borderBottom: isLast ? 'none' : '1.5px solid #C5C8B5' }}
                className="flex items-center justify-between gap-4 px-6 py-3.5
                           hover:bg-[#F0E8D8] transition-colors duration-100 no-underline"
              >
                {/* Name + badge */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="text-[12px] font-medium text-[#1A1A1A] truncate"
                  >
                    {opp.username}
                  </span>
                  <Badge variant={opp.badge} />
                </div>

                {/* W/D/L compact */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  {[
                    { val: opp.wins,   color: '#22AA44' },
                    { val: opp.draws,  color: '#9B9088' },
                    { val: opp.losses, color: '#CC2222' },
                  ].map((s, idx) => (
                    <span key={idx}>
                      <span
                        style={{ fontFamily: "'Playfair Display', serif", color: s.color }}
                        className="text-[14px] font-bold"
                      >
                        {s.val}
                      </span>
                      {idx < 2 && (
                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-[10px] text-[#C5C8B5] mx-0.5"
                        >
                          /
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                {/* ELO delta */}
                <div className="hidden md:block shrink-0">
                  <DeltaPill value={opp.theirEloDelta} />
                </div>

                {/* Last played */}
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[10px] text-[#9B9088] shrink-0"
                >
                  {formatLastPlayed(opp.lastPlayedAt)}
                </span>

                <PiCaretRight size={12} className="text-[#C5C8B5] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}