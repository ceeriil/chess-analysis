'use client';

// ============================================================
// ⬢ useNemeses
// Filtered nemesis + revenge candidate lists.
// Sliced from the full opponents list — no extra fetches.
//
// Usage:
//   const { nemeses, revengeCandidates } = useNemeses(opponents, myCurrentElo);
// ============================================================

import { useMemo } from 'react';
import { getNemeses, getRevengeCandidates } from '@/models/processing';
import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type UseNemesesState = {
  nemeses:           OpponentSummary[];
  revengeCandidates: OpponentSummary[];
  worstNemesis:      OpponentSummary | null;   // the one who's hurt you most
};

// ─── HOOK ────────────────────────────────────────────────────

export function useNemeses(
  opponents:    OpponentSummary[],
  myCurrentElo: number = 0,
): UseNemesesState {

  const nemeses = useMemo(
    () => getNemeses(opponents),
    [opponents],
  );

  const revengeCandidates = useMemo(
    () => getRevengeCandidates(opponents, myCurrentElo),
    [opponents, myCurrentElo],
  );

  // Worst nemesis = most losses to a single opponent
  const worstNemesis = useMemo(
    () => nemeses.length > 0
      ? [...nemeses].sort((a, b) => b.losses - a.losses)[0] ?? null
      : null,
    [nemeses],
  );

  return { nemeses, revengeCandidates, worstNemesis };
}