'use client';

// ============================================================
// ⬢ usePlayer
// Fetches player profile + stats + online status in parallel.
// Handles loading, error, and not-found states.
//
// Usage:
//   const { player, stats, isOnline, loading, error } = usePlayer(username);
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getPlayerFull }  from '@/libs/chess/api';
import { isChessApiError } from '@/utils/errors';
import type { Player, PlayerStats } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type UsePlayerState = {
  player:   Player | null;
  stats:    PlayerStats | null;
  isOnline: boolean;
  loading:  boolean;
  error:    string | null;
  notFound: boolean;
  refetch:  () => void;
};

// ─── HOOK ────────────────────────────────────────────────────

export function usePlayer(username: string | null | undefined): UsePlayerState {

  // ── State ──

  const [player,   setPlayer]   = useState<Player | null>(null);
  const [stats,    setStats]    = useState<PlayerStats | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tick,     setTick]     = useState(0);  // bump to trigger refetch

  // ── Fetch ──

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!username?.trim()) return;

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const result = await getPlayerFull(username!.trim().toLowerCase());

        if (cancelled) return;

        setPlayer(result.player);
        setStats(result.stats);
        setIsOnline(result.isOnline);
      } catch (err) {
        if (cancelled) return;

        if (isChessApiError(err)) {
          if (err.code === 'NOT_FOUND') {
            setNotFound(true);
          } else {
            setError(err.message);
          }
        } else {
          setError('Something went wrong fetching this player.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => { cancelled = true; };
  }, [username, tick]);

  return { player, stats, isOnline, loading, error, notFound, refetch };
}