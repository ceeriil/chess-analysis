'use client';

// ============================================================
// ⬢ useGames
// Fetches complete game history for a username.
// Exposes progress so the UI can show "fetching 4/24 months".
// Caches aggressively — past months never re-fetch.
//
// Usage:
//   const { games, loading, progress, error } = useGames(username);
//   const { games } = useGames(username, { timeControl: 'rapid' });
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getAllGames }      from '@/libs/chess/api';
import { isChessApiError }  from '@/utils/errors';
import type { ParsedGame, TimeControl } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type UseGamesOptions = {
  timeControl?: TimeControl;
  fromDate?:    Date;
  toDate?:      Date;
  skip?:        boolean;   // don't fetch yet (wait for username to be confirmed)
};

type FetchProgress = {
  fetched: number;
  total:   number;
  pct:     number;         // 0–100
};

type UseGamesState = {
  games:    ParsedGame[];
  loading:  boolean;
  progress: FetchProgress;
  error:    string | null;
  refetch:  () => void;
};

// ─── HOOK ────────────────────────────────────────────────────

export function useGames(
  username: string | null | undefined,
  options:  UseGamesOptions = {},
): UseGamesState {
  const { timeControl, fromDate, toDate, skip = false } = options;

  // ── State ──

  const [games,   setGames]   = useState<ParsedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [progress, setProgress] = useState<FetchProgress>({
    fetched: 0,
    total:   0,
    pct:     0,
  });
  const [tick, setTick] = useState(0);

  // ── Fetch ──

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!username?.trim() || skip) return;

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      setProgress({ fetched: 0, total: 0, pct: 0 });

      try {
        const result = await getAllGames({
          username:    username!.trim().toLowerCase(),
          timeControl,
          fromDate,
          toDate,
          onProgress: (fetched, total) => {
            if (cancelled) return;
            setProgress({
              fetched,
              total,
              pct: total > 0 ? Math.round((fetched / total) * 100) : 0,
            });
          },
        });

        if (cancelled) return;
        setGames(result);
      } catch (err) {
        if (cancelled) return;

        if (isChessApiError(err)) {
          setError(err.message);
        } else {
          setError('Failed to load game history.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => { cancelled = true; };

  // Intentionally not including fromDate/toDate as deps —
  // callers should memoize them if they're dynamic.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, timeControl, skip, tick]);

  return { games, loading, progress, error, refetch };
}