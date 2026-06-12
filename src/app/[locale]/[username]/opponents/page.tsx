'use client';

// ============================================================
// ⬢ OPPONENTS PAGE
// src/app/[locale]/[username]/opponents/page.tsx
//
// Performance fix: useDeferredValue on filteredGames so the
// time control tab responds instantly. deriveOpponents is
// heavy (iterates all games per opponent) — without deferral
// it blocks the main thread and the UI appears frozen.
//
// Data flow:
//   useGames          → all games (cached)
//   filteredGames     → useMemo slice by timeControl
//   deferredGames     → useDeferredValue — defers heavy recompute
//   useOpponents      → derives from deferredGames
//   isPending         → filteredGames !== deferredGames → show indicator
// ============================================================

import {
  use,
  useState,
  useMemo,
  useDeferredValue,
  useTransition,
} from 'react';

import { usePlayer }           from '@/hooks/usePlayer';
import { useGames }            from '@/hooks/useGames';
import { useOpponents }        from '@/hooks/useOpponents';
import { useOpponentElos, pickCurrentElo } from '@/hooks/useOpponentElos';

import { OpponentsStatsBar }   from '@/components/opponents/OpponentsStatsBar';
import { OpponentsFilterBar }  from '@/components/opponents/OpponentsFilterBar';
import { OpponentsGrid }       from '@/components/opponents/OpponentsGrid';
import { OpponentsTableView }  from '@/components/opponents/OpponentsTableView';
import { TimeControlSelector } from '@/components/dashboard/TimeControlSelector';
import { PageSpinner }         from '@/components/ui/Spinner';
import { Spinner }             from '@/components/ui/Spinner';
import { Button }              from '@/components/ui/Button';
import { EmptyState }          from '@/components/ui/EmptyState';

import { PiArrowCounterClockwise, PiWarning } from 'react-icons/pi';
import type { TimeControlOption } from '@/components/dashboard/TimeControlSelector';
import type { ViewMode }          from '@/components/opponents/OpponentsFilterBar';
import type { ParsedGame }        from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type OpponentsPageProps = {
  params: Promise<{ locale: string; username: string }>;
};

// ─── PAGE ────────────────────────────────────────────────────

export default function OpponentsPage({ params }: OpponentsPageProps) {
  const { locale, username } = use(params);

  // ── UI state ──
  const [viewMode,    setViewMode]    = useState<ViewMode>('table');
  const [timeControl, setTimeControl] = useState<TimeControlOption>('rapid');

  // ── Data ──
  const { stats } = usePlayer(username);

  const {
    games,
    loading:  gamesLoading,
    progress,
    error:    gamesError,
    refetch,
  } = useGames(username);

  // ── Filter by time control ──
  // This is instant — just an array filter on already-loaded data.
  const filteredGames = useMemo((): ParsedGame[] => {
    if (timeControl === 'all') return games;
    return games.filter((g) => g.timeControl === timeControl);
  }, [games, timeControl]);

  // ── Defer the expensive part ──
  // useDeferredValue tells React: if something more urgent comes in
  // (like a tab click), defer updating this value until the thread is free.
  // filteredGames updates instantly → tab click is responsive.
  // deferredGames updates after → deriveOpponents runs without blocking.
  const deferredGames = useDeferredValue(filteredGames);

  // True while deferredGames is still catching up to filteredGames.
  // Use this to show a subtle "updating" overlay on the content.
  const isUpdating = filteredGames !== deferredGames;

  // ── Derive opponents from the DEFERRED games ──
  const {
    all,
    opponents: baseOpponents,
    counts,
    sort,
    sortDir,
    filters,
    search,
    setSort,
    setFilters,
    setSearch,
    resetFilters,
  } = useOpponents(deferredGames, username);

  const myCurrentElo = stats?.rapid?.current ?? stats?.blitz?.current ?? 0;

  // Fetch current ELO for every opponent in background batches.
  // Uses `all` (pre-filter) so hidden opponents still get fetched.
  const allUsernames = useMemo(() => all.map((o) => o.username), [all]);
  const { eloMap } = useOpponentElos(allUsernames);

  // When sorting by theirElo, override with live current elo from the API.
  // Falls back to theirEloAtLast for opponents not yet fetched.
  const opponents = useMemo(() => {
    if (sort !== 'theirElo' || eloMap.size === 0) return baseOpponents;
    return [...baseOpponents].sort((a, b) => {
      const aStats = eloMap.get(a.username.toLowerCase());
      const bStats = eloMap.get(b.username.toLowerCase());
      const aElo = aStats ? pickCurrentElo(aStats) : a.theirEloAtLast;
      const bElo = bStats ? pickCurrentElo(bStats) : b.theirEloAtLast;
      return sortDir === 'asc' ? aElo - bElo : bElo - aElo;
    });
  }, [baseOpponents, sort, sortDir, eloMap]);

  // ── Full-page loading (first fetch only) ──
  if (gamesLoading) {
    return (
      <PageSpinner
        message={
          progress.total > 0
            ? `Fetching games… ${progress.fetched}/${progress.total} months`
            : 'Building opponent list…'
        }
        subMessage={progress.total > 0 ? `${progress.pct}% complete` : undefined}
      />
    );
  }

  // ── Error ──
  if (gamesError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<PiWarning size={24} />}
          title="Failed to load games"
          description={gamesError}
          action={
            <Button
              variant="primary"
              size="sm"
              iconLeft={<PiArrowCounterClockwise size={13} />}
              onClick={refetch}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="flex flex-col">

      {/* ── Page header ── */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between
                   gap-4 px-6 py-5 bg-[#F8F3E8]"
      >
        <div className="flex flex-col gap-1">
          <h1
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold tracking-[0.1em] uppercase text-[#1A1A1A]"
          >
            Opponent Intelligence
          </h1>
          <p
            style={{ fontFamily: "'Spectral', serif" }}
            className="text-[13px] italic text-[#9B9088]"
          >
            Every player you've faced, ranked by damage inflicted.
          </p>
        </div>
        <TimeControlSelector value={timeControl} onChange={setTimeControl} />
      </div>

      {/* ── Summary stats ── */}
      <OpponentsStatsBar all={all} />

      {/* ── Filter bar ── */}
      <OpponentsFilterBar
        counts={counts}
        filters={filters}
        search={search}
        sort={sort}
        viewMode={viewMode}
        resultCount={opponents.length}
        setFilters={setFilters}
        setSearch={setSearch}
        setSort={setSort}
        setViewMode={setViewMode}
        resetFilters={resetFilters}
      />

      {/* ── Content — with updating overlay ── */}
      <div className="relative flex-1">

        {/* Subtle updating indicator — not a full spinner, just a top bar + opacity */}
        {isUpdating && (
          <>
            {/* Progress bar crawl across top of content */}
            <div
              className="absolute top-0 left-0 right-0 z-10 h-[2px] bg-[#F0E8D8] overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-[#1A1A1A]"
                style={{ animation: 'pm-progress 0.8s ease-in-out infinite' }}
              />
            </div>
            {/* Dim the stale content slightly */}
            <div className="absolute inset-0 z-[5] bg-[#F8F3E8]/40 pointer-events-none" />
          </>
        )}

        {viewMode === 'grid' ? (
          <OpponentsGrid
            opponents={opponents}
            loading={false}
            username={username}
            locale={locale}
            myCurrentElo={myCurrentElo}
            eloMap={eloMap}
          />
        ) : (
          <OpponentsTableView
            opponents={opponents}
            loading={false}
            username={username}
            locale={locale}
            myCurrentElo={myCurrentElo}
            sort={sort}
            sortDir={sortDir}
            onSort={setSort}
            eloMap={eloMap}
          />
        )}
      </div>

    </div>
  );
}