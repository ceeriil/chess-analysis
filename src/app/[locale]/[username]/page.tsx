'use client';

// ============================================================
// ⬢ DASHBOARD PAGE
// src/app/[locale]/[username]/page.tsx
//
// Data flow:
//   usePlayer       → profile, stats, online
//   useGames        → ALL games, fetched once, cached
//   filteredGames   → useMemo slice of games by timeControl
//   useOpponents    → derived from filteredGames
//   useNemeses      → derived from filteredOpponents
//   eloTimeline     → derived from filteredGames, no second fetch
//
// timeControl state propagates downward via filteredGames —
// no redundant fetches, no loading flashes on TC switch.
// ============================================================

import { use, useState, useMemo }  from 'react';
import { useRouter }               from 'next/navigation';

import { usePlayer }               from '@/hooks/usePlayer';
import { useGames }                from '@/hooks/useGames';
import { useOpponents }            from '@/hooks/useOpponents';
import { useNemeses }              from '@/hooks/useNemeses';

import { PlayerHeader }            from '@/components/dashboard/PlayerHeader';
import { StatsStrip }              from '@/components/dashboard/StatsStrip';
import { EloChart }                from '@/components/dashboard/EloChart';
import { NemesisPreview }          from '@/components/dashboard/NemesisPreview';
import { RecentOpponents }         from '@/components/dashboard/RecentOpponents';
import { TimeControlSelector }     from '@/components/dashboard/TimeControlSelector';
import { PageSpinner }             from '@/components/ui/Spinner';
import { Button }                  from '@/components/ui/Button';
import { EmptyState }              from '@/components/ui/EmptyState';

import {
  PiWarning,
  PiArrowCounterClockwise,
  PiArrowsClockwise,
} from 'react-icons/pi';
import type { TimeControlOption }  from '@/components/dashboard/TimeControlSelector';
import type { ParsedGame }         from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type DashboardPageProps = {
  params: Promise<{ locale: string; username: string }>;
};

// ─── HELPERS ─────────────────────────────────────────────────

// Derive ELO timeline from games — oldest first, for Recharts
function deriveEloTimeline(games: ParsedGame[]) {
  return [...games]
    .sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime())
    .map((g) => ({
      date:             g.playedAt,
      elo:              g.myRating,
      result:           g.result === 'win'  ? 'win' as const
                      : g.result === 'loss' ? 'loss' as const
                      : 'draw' as const,
      opponentUsername: g.opponentUsername,
      opponentElo:      g.opponentRating,
    }));
}

// ─── PAGE ────────────────────────────────────────────────────

export default function DashboardPage({ params }: DashboardPageProps) {
  const { locale, username } = use(params);
  const router = useRouter();

  // ── Time control (Rapid default) ──
  const [timeControl, setTimeControl] = useState<TimeControlOption>('rapid');

  // ── Data hooks ──

  const {
    player,
    stats,
    loading:  playerLoading,
    error:    playerError,
    notFound,
  } = usePlayer(username);

  const {
    games,
    loading:  gamesLoading,
    progress,
    error:    gamesError,
    refetch:  refetchGames,
  } = useGames(username);

  // ── Filter games by time control — the single source of truth ──
  // Everything downstream (opponents, nemeses, chart) reads from this.

  const filteredGames = useMemo((): ParsedGame[] => {
    if (timeControl === 'all') return games;
    return games.filter((g) => g.timeControl === timeControl);
  }, [games, timeControl]);

  // ── Derive ELO timeline — no second fetch, just a memo slice ──
  // Limit to last 90 days for chart readability on the dashboard.

  const recentCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
  }, []);

  const eloTimeline = useMemo(
    () => deriveEloTimeline(
      filteredGames.filter((g) => g.playedAt >= recentCutoff),
    ),
    [filteredGames, recentCutoff],
  );

  // ── Opponents + nemeses derived from filteredGames ──

  const { opponents } = useOpponents(filteredGames, username);

  const { nemeses } = useNemeses(
    opponents,
    stats?.rapid?.current ?? 0,
  );

  // ── States ──

  const isLoading = playerLoading || gamesLoading;

  // ── Not found ──
  if (!playerLoading && notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-8 text-center">
        <div
          style={{ border: '1.5px solid #CC2222' }}
          className="w-14 h-14 flex items-center justify-center text-[#CC2222]"
        >
          <PiWarning size={26} />
        </div>
        <div className="flex flex-col gap-2 max-w-sm">
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#1A1A1A]"
          >
            Player not found
          </p>
          <p
            style={{ fontFamily: "'Spectral', serif" }}
            className="text-[13px] text-[#9B9088] leading-[1.65]"
          >
            <strong>{username}</strong> doesn&apos;t exist on Chess.com.
            Check the spelling and try again.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push(`/${locale}`)}>
          Search another
        </Button>
      </div>
    );
  }

  // ── API error ──
  if (!isLoading && (playerError || gamesError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-8 text-center">
        <EmptyState
          icon={<PiWarning size={24} />}
          title="Failed to load"
          description={playerError ?? gamesError ?? 'Something went wrong.'}
          action={
            <Button
              variant="primary"
              size="sm"
              iconLeft={<PiArrowCounterClockwise size={13} />}
              onClick={refetchGames}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // ── Games loading (full-screen progress) ──
  if (gamesLoading) {
    return (
      <PageSpinner
        message={
          progress.total > 0
            ? `Fetching games… ${progress.fetched}/${progress.total} months`
            : 'Fetching game history…'
        }
        subMessage={
          progress.total > 0
            ? `${progress.pct}% complete`
            : 'This can take a moment for active accounts'
        }
      />
    );
  }

  // ── Active rating for StatsStrip ──
  const activeRating =
    timeControl === 'all' || timeControl === 'rapid' ? stats?.rapid
    : timeControl === 'blitz'                        ? stats?.blitz
    : stats?.bullet;

  // ── Render ──

  return (
    <div className="flex flex-col">

      {/* ── Player header + manual refresh ── */}
      <div className="relative">
        {player && stats && (
          <PlayerHeader
            player={player}
            stats={stats}
            timeControl={timeControl}
          />
        )}
        {/* Manual refresh — top-right corner */}
        <button
          type="button"
          onClick={refetchGames}
          title="Refresh game data"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="absolute top-4 right-4 flex items-center gap-1.5
                     text-[10px] font-semibold tracking-[0.1em] uppercase
                     text-[#9B9088] hover:text-[#1A1A1A] transition-colors duration-150"
        >
          <PiArrowsClockwise size={13} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Stats strip ── */}
      <StatsStrip
        rating={activeRating ?? null}
        opponents={opponents}
        totalGames={filteredGames.length}
      />

      {/* ── ELO chart ── */}
      <section style={{ borderBottom: '1.5px solid #1A1A1A' }}>
        <div
          style={{ borderBottom: '1.5px solid #1A1A1A' }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4"
        >
          <div className="flex flex-col gap-0.5">
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1A1A1A]"
            >
              ELO Trajectory — Last 90 Days
            </p>
            {filteredGames.length === 0 && !gamesLoading && (
              <p
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-[10px] text-[#9B9088]"
              >
                No {timeControl === 'all' ? '' : timeControl} games in the last 90 days
              </p>
            )}
          </div>
          <TimeControlSelector value={timeControl} onChange={setTimeControl} />
        </div>
        <div className="px-6 py-6">
          <EloChart data={eloTimeline} loading={false} />
        </div>
      </section>

      {/* ── Nemesis preview ── */}
      <section style={{ borderBottom: '1.5px solid #1A1A1A' }}>
        <NemesisPreview
          nemeses={nemeses}
          loading={false}
          username={username}
          locale={locale}
        />
      </section>

      {/* ── Recent opponents ── */}
      <RecentOpponents
        opponents={opponents}
        loading={false}
        username={username}
        locale={locale}
      />
    </div>
  );
}