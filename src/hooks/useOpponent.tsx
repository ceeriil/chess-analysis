'use client';

// ============================================================
// ⬢ useOpponent
// Single opponent by username — sliced from the full list.
// Also fetches their current Chess.com profile for live ELO.
//
// Usage:
//   const { opponent, theirProfile, loading } = useOpponent(opponents, 'SilentDestroyer');
// ============================================================

import { useState, useEffect, useMemo }  from 'react';
import { getPlayer, getOnlineStatus }     from '@/libs/chess/api';
import { isChessApiError }                from '@/utils/errors';
import { getOpponentByUsername }          from '@/models/processing';
import type { OpponentSummary, Player }   from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type UseOpponentState = {
  opponent:     OpponentSummary | null;
  theirProfile: Player | null;          // live Chess.com profile
  theirOnline:  boolean;
  notFound:     boolean;
  profileLoading: boolean;
};

// ─── HOOK ────────────────────────────────────────────────────

export function useOpponent(
  opponents:        OpponentSummary[],
  opponentUsername: string | null | undefined,
): UseOpponentState {

  // ── Slice from opponents list (no re-derive needed) ──

  const opponent = useMemo(
    () => opponentUsername
      ? getOpponentByUsername(opponents, opponentUsername)
      : undefined,
    [opponents, opponentUsername],
  );

  // ── Fetch their live profile separately ──
  // We already have ELO snapshots from the games, but their
  // current profile shows live rating + avatar + online status.

  const [theirProfile,    setTheirProfile]    = useState<Player | null>(null);
  const [theirOnline,     setTheirOnline]     = useState(false);
  const [profileLoading,  setProfileLoading]  = useState(false);

  useEffect(() => {
    if (!opponentUsername?.trim()) return;

    let cancelled = false;

    async function fetchProfile() {
      setProfileLoading(true);

      try {
        const [profile, online] = await Promise.all([
          getPlayer(opponentUsername!.trim().toLowerCase()),
          getOnlineStatus(opponentUsername!.trim().toLowerCase()),
        ]);

        if (cancelled) return;
        setTheirProfile({ ...profile, isOnline: online });
        setTheirOnline(online);
      } catch (err) {
        // Non-fatal — we still have game data even if profile fetch fails
        if (!cancelled && isChessApiError(err) && err.code !== 'NOT_FOUND') {
          console.warn(`Could not fetch profile for ${opponentUsername}:`, err.message);
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [opponentUsername]);

  return {
    opponent:      opponent ?? null,
    theirProfile,
    theirOnline,
    notFound:      opponents.length > 0 && !opponent,
    profileLoading,
  };
}