// ============================================================
// ⬢ OPPONENTS GRID
// Card grid layout with skeleton loading and empty state.
// Server-safe — pure props.
// ============================================================

import { OpponentCard }        from '@/components/opponents/OpponentCard';
import { OpponentCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState }           from '@/components/ui/EmptyState';
import { PiSword }              from 'react-icons/pi';
import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type OpponentsGridProps = {
  opponents:    OpponentSummary[];
  loading:      boolean;
  username:     string;
  locale:       string;
  myCurrentElo: number;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function OpponentsGrid({
  opponents,
  loading,
  username,
  locale,
  myCurrentElo,
}: OpponentsGridProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRight:  (i % 3 !== 2) ? '1.5px solid #1A1A1A' : 'none',
              borderBottom: '1.5px solid #1A1A1A',
            }}
          >
            <OpponentCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (opponents.length === 0) {
    return (
      <EmptyState
        icon={<PiSword size={26} />}
        title="No opponents match"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {opponents.map((opp, i) => {
        // Border logic: right border except last in row, bottom always
        const col     = i % 3;
        const isLast  = i === opponents.length - 1;

        return (
          <div
            key={opp.username}
            style={{
              borderRight:  col !== 2 ? '1.5px solid #1A1A1A' : 'none',
              borderBottom: !isLast   ? '1.5px solid #1A1A1A' : 'none',
            }}
          >
            <OpponentCard
              opponent={opp}
              href={`/${locale}/${username}/opponents/${opp.username}`}
              myCurrentElo={myCurrentElo}
            />
          </div>
        );
      })}
    </div>
  );
}