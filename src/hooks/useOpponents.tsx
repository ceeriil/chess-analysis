'use client';

// ============================================================
// ⬢ useOpponents
// Derives OpponentSummary[] from ParsedGame[].
// Exposes sort, filter, and search — all in-memory, no refetch.
//
// Usage:
//   const { opponents, setSort, setFilter, setSearch } = useOpponents(games, username);
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { deriveOpponents } from '@/models/processing';
import type { ParsedGame, OpponentSummary, BadgeVariant, TimeControl } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

export type OpponentSortKey =
  | 'games'        // most games played (default)
  | 'losses'       // most losses to them
  | 'wins'         // most wins against them
  | 'winRate'      // win rate asc (who's worst for you first)
  | 'lastPlayed'   // most recently played
  | 'theirElo'     // their current ELO
  | 'eloDelta';    // how much they've improved since you met

export type OpponentSortDir = 'asc' | 'desc';

export type OpponentFilters = {
  badge?:        BadgeVariant | 'all';
  timeControl?:  TimeControl  | 'all';
  activeOnly?:   boolean;
};

type UseOpponentsState = {
  // All opponents (unfiltered, unsorted) — for counts
  all:          OpponentSummary[];
  // Filtered + sorted + searched result
  opponents:    OpponentSummary[];
  // Counts per badge for filter tabs
  counts: {
    all:         number;
    nemesis:     number;
    rival:       number;
    'punching-bag': number;
    dormant:     number;
    active:      number;
  };
  // Controls
  sort:         OpponentSortKey;
  sortDir:      OpponentSortDir;
  filters:      OpponentFilters;
  search:       string;
  setSort:      (key: OpponentSortKey, dir?: OpponentSortDir) => void;
  setFilters:   (f: Partial<OpponentFilters>) => void;
  setSearch:    (s: string) => void;
  resetFilters: () => void;
};

// ─── DEFAULTS ────────────────────────────────────────────────

const DEFAULT_SORT:    OpponentSortKey = 'losses';
const DEFAULT_SORT_DIR: OpponentSortDir = 'desc';
const DEFAULT_FILTERS: OpponentFilters = { badge: 'all', timeControl: 'all', activeOnly: false };

// ─── SORT FUNCTION ───────────────────────────────────────────

function sortOpponents(
  list: OpponentSummary[],
  key:  OpponentSortKey,
  dir:  OpponentSortDir,
): OpponentSummary[] {
  const sorted = [...list].sort((a, b) => {
    switch (key) {
      case 'games':      return b.totalGames     - a.totalGames;
      case 'losses':     return b.losses         - a.losses;
      case 'wins':       return b.wins           - a.wins;
      case 'winRate':    return a.winRate         - b.winRate;   // asc = worst first
      case 'lastPlayed': return b.lastPlayedAt.getTime() - a.lastPlayedAt.getTime();
      case 'theirElo':   return b.theirEloAtLast - a.theirEloAtLast;
      case 'eloDelta':   return b.theirEloDelta  - a.theirEloDelta;
      default:           return 0;
    }
  });

  return dir === 'asc' ? sorted.reverse() : sorted;
}

// ─── HOOK ────────────────────────────────────────────────────

export function useOpponents(
  games:    ParsedGame[],
  username: string,
): UseOpponentsState {

  // ── Controls state ──

  const [sort,    setSort_]    = useState<OpponentSortKey>(DEFAULT_SORT);
  const [sortDir, setSortDir]  = useState<OpponentSortDir>(DEFAULT_SORT_DIR);
  const [filters, setFilters_] = useState<OpponentFilters>(DEFAULT_FILTERS);
  const [search,  setSearch_]  = useState('');

  // ── Derive all opponents (memo — only recomputes when games change) ──

  const all = useMemo(
    () => deriveOpponents(games, username),
    [games, username],
  );

  // ── Badge counts ──

  const counts = useMemo(() => ({
    all:           all.length,
    nemesis:       all.filter((o) => o.badge === 'nemesis').length,
    rival:         all.filter((o) => o.badge === 'rival').length,
    'punching-bag': all.filter((o) => o.badge === 'punching-bag').length,
    dormant:       all.filter((o) => o.badge === 'dormant').length,
    active:        all.filter((o) => o.badge === 'active').length,
  }), [all]);

  // ── Filter + search + sort pipeline ──

  const opponents = useMemo(() => {
    let result = all;

    // Badge filter
    if (filters.badge && filters.badge !== 'all') {
      result = result.filter((o) => o.badge === filters.badge);
    }

    // Time control filter
    if (filters.timeControl && filters.timeControl !== 'all') {
      result = result.filter((o) =>
        o.timeControls.includes(filters.timeControl as TimeControl),
      );
    }

    // Active only filter (exclude dormant)
    if (filters.activeOnly) {
      result = result.filter((o) => o.badge !== 'dormant');
    }

    // Search by username
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((o) => o.username.toLowerCase().includes(q));
    }

    // Sort
    return sortOpponents(result, sort, sortDir);
  }, [all, filters, search, sort, sortDir]);

  // ── Setters ──

  const setSort = useCallback((key: OpponentSortKey, dir?: OpponentSortDir) => {
    setSort_(key);
    // Toggle direction if same key clicked, otherwise default desc
    setSortDir(dir ?? (key === sort ? (sortDir === 'desc' ? 'asc' : 'desc') : DEFAULT_SORT_DIR));
  }, [sort, sortDir]);

  const setFilters = useCallback((partial: Partial<OpponentFilters>) => {
    setFilters_((prev) => ({ ...prev, ...partial }));
  }, []);

  const setSearch = useCallback((s: string) => setSearch_(s), []);

  const resetFilters = useCallback(() => {
    setFilters_(DEFAULT_FILTERS);
    setSearch_('');
    setSort_(DEFAULT_SORT);
    setSortDir(DEFAULT_SORT_DIR);
  }, []);

  return {
    all,
    opponents,
    counts,
    sort,
    sortDir,
    filters,
    search,
    setSort,
    setFilters,
    setSearch,
    resetFilters,
  };
}