'use client';

// ============================================================
// ⬢ useOpponentElos
// Fetches current PlayerStats for every opponent in background
// batches of 5. Returns an EloMap that fills as requests land.
//
// Keyed by joined username string so filter/sort changes on the
// same opponent list don't re-trigger fetches.
// ============================================================

import { useState, useEffect } from 'react';
import { getPlayerStats } from '@/libs/chess/api';
import type { PlayerStats } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

export type EloMap = Map<string, PlayerStats>;

// ─── HELPERS ─────────────────────────────────────────────────

const CONCURRENCY = 5;

/** Picks the best available current rating across all time controls. */
export function pickCurrentElo(stats: PlayerStats): number {
  return stats.rapid?.current
      ?? stats.blitz?.current
      ?? stats.bullet?.current
      ?? stats.daily?.current
      ?? 0;
}

// ─── HOOK ────────────────────────────────────────────────────

export function useOpponentElos(usernames: string[]): {
  eloMap:  EloMap;
  loading: boolean;
} {
  const [eloMap,  setEloMap]  = useState<EloMap>(new Map());
  const [loading, setLoading] = useState(false);

  // Stable key — effect only re-runs when the opponent set changes.
  const key = usernames.join(',');

  useEffect(() => {
    if (usernames.length === 0) return;

    let cancelled = false;
    setEloMap(new Map());
    setLoading(true);

    async function runBatched() {
      for (let i = 0; i < usernames.length; i += CONCURRENCY) {
        if (cancelled) break;

        const batch   = usernames.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
          batch.map((u) => getPlayerStats(u)),
        );

        if (cancelled) break;

        setEloMap((prev) => {
          const next = new Map(prev);
          batch.forEach((u, j) => {
            const r = results[j];
            if (r?.status === 'fulfilled') {
              next.set(u.toLowerCase(), r.value);
            }
          });
          return next;
        });
      }

      if (!cancelled) setLoading(false);
    }

    runBatched();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { eloMap, loading };
}
