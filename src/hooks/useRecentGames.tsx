'use client';

// ============================================================
// ⬢ useRecentGames
// Last N months of games — lighter fetch for dashboard.
// Derives ELO timeline data for sparklines/charts.
//
// Usage:
//   const { games, eloTimeline, loading } = useRecentGames(username, 3);
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getRecentGames }  from '@/libs/chess/api';
import { isChessApiError }  from '@/utils/errors';
import type { ParsedGame, TimeControl } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type EloDataPoint = {
  date:        Date;
  elo:         number;
  result:      'win' | 'loss' | 'draw';
  opponentUsername: string;
  opponentElo: number;
};

type UseRecentGamesState = {
  games:       ParsedGame[];
  eloTimeline: EloDataPoint[];   // sorted oldest-first for charts
  loading:     boolean;
  error:       string | null;
  refetch:     () => void;
};

// ─── HOOK ────────────────────────────────────────────────────

export function useRecentGames(
  username:    string | null | undefined,
  months:      number      = 3,
  timeControl?: TimeControl,
): UseRecentGamesState {

  // ── State ──

  const [games,   setGames]   = useState<ParsedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  // ── Fetch ──

  useEffect(() => {
    if (!username?.trim()) return;

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const result = await getRecentGames(username!.trim().toLowerCase(), months);

        if (cancelled) return;

        const filtered = timeControl
          ? result.filter((g) => g.timeControl === timeControl)
          : result;

        setGames(filtered);
      } catch (err) {
        if (cancelled) return;
        if (isChessApiError(err)) {
          setError(err.message);
        } else {
          setError('Failed to load recent games.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [username, months, timeControl, tick]);

  // ── Derive ELO timeline for charts ──
  // Sorted oldest-first, one point per game.

  const eloTimeline = useMemo((): EloDataPoint[] => {
    return [...games]
      .sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime())
      .map((g) => ({
        date:             g.playedAt,
        elo:              g.myRating,
        result:           g.result === 'win'  ? 'win'
                        : g.result === 'loss' ? 'loss'
                        : 'draw',
        opponentUsername: g.opponentUsername,
        opponentElo:      g.opponentRating,
      }));
  }, [games]);

  return { games, eloTimeline, loading, error, refetch };
}