// ============================================================
// ⬢ CHESS — DATA PROCESSING
// Pure functions. No API calls, no side effects.
// Input: ParsedGame[]  →  Output: derived stats
//
// Exports:
//   deriveOpponents       — build OpponentSummary[] from games
//   classifyBadge         — assign nemesis/rival/punching-bag/etc
//   getTopOpponents       — sorted by games played
//   getNemeses            — only nemesis-classified opponents
//   getOpponentById       — single opponent by username
// ============================================================

import {
  NEMESIS_THRESHOLD,
  RIVAL_THRESHOLD,
  PUNCHING_BAG_THRESHOLD,
  DORMANT_THRESHOLD_DAYS,
} from '../constants';
import type {
  ParsedGame,
  OpponentSummary,
  OpeningFrequency,
  BadgeVariant,
} from '../types';

// ─── BADGE CLASSIFICATION ────────────────────────────────────

export function classifyBadge(
  wins:       number,
  losses:     number,
  draws:      number,
  lastPlayedAt: Date,
): BadgeVariant {
  const total    = wins + losses + draws;
  const winRate  = total > 0 ? wins   / total : 0;
  const lossRate = total > 0 ? losses / total : 0;

  const daysSinceLast = Math.floor(
    (Date.now() - lastPlayedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Nemesis: they beat you a lot
  if (
    total   >= NEMESIS_THRESHOLD.MIN_GAMES
    && losses  >= NEMESIS_THRESHOLD.MIN_LOSSES
    && lossRate >= NEMESIS_THRESHOLD.MIN_LOSS_RATE
  ) return 'nemesis';

  // Punching bag: you beat them a lot
  if (
    total   >= PUNCHING_BAG_THRESHOLD.MIN_GAMES
    && winRate >= PUNCHING_BAG_THRESHOLD.MIN_WIN_RATE
  ) return 'punching-bag';

  // Rival: contested record
  if (
    total    >= RIVAL_THRESHOLD.MIN_GAMES
    && winRate >= RIVAL_THRESHOLD.MIN_WIN_RATE
    && winRate <= RIVAL_THRESHOLD.MAX_WIN_RATE
  ) return 'rival';

  // Dormant: haven't played in a while
  if (daysSinceLast >= DORMANT_THRESHOLD_DAYS) return 'dormant';

  return 'active';
}

// ─── STREAK COMPUTATION ──────────────────────────────────────
// Games must be sorted newest-first for currentStreak to be accurate.

type StreakResult = {
  currentStreak:    { type: 'win' | 'loss' | 'draw'; count: number };
  longestWinStreak:  number;
  longestLossStreak: number;
};

function computeStreaks(games: ParsedGame[]): StreakResult {
  if (games.length === 0) {
    return {
      currentStreak:    { type: 'draw', count: 0 },
      longestWinStreak:  0,
      longestLossStreak: 0,
    };
  }

  // Sort oldest-first for streak computation
  const sorted = [...games].sort(
    (a, b) => a.playedAt.getTime() - b.playedAt.getTime(),
  );

  let longestWin  = 0;
  let longestLoss = 0;
  let curWin      = 0;
  let curLoss     = 0;

  for (const game of sorted) {
    if (game.result === 'win') {
      curWin++;
      curLoss = 0;
      longestWin = Math.max(longestWin, curWin);
    } else if (game.result === 'loss') {
      curLoss++;
      curWin = 0;
      longestLoss = Math.max(longestLoss, curLoss);
    } else {
      curWin  = 0;
      curLoss = 0;
    }
  }

  // Current streak is from the most recent game backwards (games sorted newest-first in input)
  const mostRecent = games[0]!;
  let streakType  = mostRecent.result === 'win' ? 'win'
    : mostRecent.result === 'loss' ? 'loss'
    : 'draw';
  let streakCount = 0;

  for (const game of games) {   // games is newest-first
    const r = game.result === 'win' ? 'win'
      : game.result === 'loss' ? 'loss'
      : 'draw';
    if (r === streakType) {
      streakCount++;
    } else {
      break;
    }
  }

  return {
    currentStreak:    { type: streakType as 'win' | 'loss' | 'draw', count: streakCount },
    longestWinStreak:  longestWin,
    longestLossStreak: longestLoss,
  };
}

// ─── OPENING FREQUENCY ───────────────────────────────────────

function buildOpeningFrequency(games: ParsedGame[]): OpeningFrequency[] {
  const map = new Map<string, OpeningFrequency>();

  for (const game of games) {
    if (!game.eco || !game.opening) continue;

    const key = game.eco;
    const existing = map.get(key);

    if (existing) {
      existing.count++;
      if (game.result === 'win')  existing.myWins++;
      if (game.result === 'loss') existing.myLosses++;
      if (game.result === 'draw') existing.myDraws++;
    } else {
      map.set(key, {
        eco:      game.eco,
        name:     game.opening,
        count:    1,
        myWins:   game.result === 'win'  ? 1 : 0,
        myLosses: game.result === 'loss' ? 1 : 0,
        myDraws:  game.result === 'draw' ? 1 : 0,
        winRate:  0,   // calculated below
      });
    }
  }

  return Array.from(map.values())
    .map((f) => ({
      ...f,
      winRate: f.count > 0 ? Math.round((f.myWins / f.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── DERIVE OPPONENTS ────────────────────────────────────────
// Main function. Takes all your games, returns one OpponentSummary
// per opponent, sorted by total games (desc).

export function deriveOpponents(
  games:    ParsedGame[],
  myUsername: string,
): OpponentSummary[] {
  const u = myUsername.toLowerCase();

  // Group games by opponent
  const byOpponent = new Map<string, ParsedGame[]>();

  for (const game of games) {
    const opp = game.opponentUsername.toLowerCase();
    if (opp === u) continue;   // skip self-play (shouldn't happen but just in case)

    const existing = byOpponent.get(opp);
    if (existing) {
      existing.push(game);
    } else {
      byOpponent.set(opp, [game]);
    }
  }

  // Build summary for each opponent
  const summaries: OpponentSummary[] = [];

  for (const [oppUsername, oppGames] of byOpponent.entries()) {
    // Sort newest-first
    const sorted = [...oppGames].sort(
      (a, b) => b.playedAt.getTime() - a.playedAt.getTime(),
    );

    const wins   = sorted.filter((g) => g.result === 'win').length;
    const losses = sorted.filter((g) => g.result === 'loss').length;
    const draws  = sorted.filter((g) => g.result === 'draw').length;
    const total  = sorted.length;

    const firstGame = sorted.at(-1)!;   // oldest
    const lastGame  = sorted.at(0)!;    // newest

    const daysSinceLast = Math.floor(
      (Date.now() - lastGame.playedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const badge = classifyBadge(wins, losses, draws, lastGame.playedAt);
    const streaks = computeStreaks(sorted);

    // Time controls used with this opponent
    const tcSet = new Set<TimeControl>(sorted.map((g) => g.timeControl));

    summaries.push({
      username:          oppUsername,
      wins,
      losses,
      draws,
      totalGames:        total,
      winRate:           total > 0 ? Math.round((wins / total) * 100) : 0,

      myEloAtFirst:      firstGame.myRating,
      theirEloAtFirst:   firstGame.opponentRating,
      myEloAtLast:       lastGame.myRating,
      theirEloAtLast:    lastGame.opponentRating,
      theirEloDelta:     lastGame.opponentRating - firstGame.opponentRating,

      firstPlayedAt:     firstGame.playedAt,
      lastPlayedAt:      lastGame.playedAt,
      daysSinceLastGame: daysSinceLast,

      badge,

      currentStreak:     streaks.currentStreak,
      longestWinStreak:  streaks.longestWinStreak,
      longestLossStreak: streaks.longestLossStreak,

      games:             sorted,
      openingsAgainstMe: buildOpeningFrequency(sorted),
      timeControls:      Array.from(tcSet),
    });
  }

  // Default sort: most games first
  return summaries.sort((a, b) => b.totalGames - a.totalGames);
}

// ─── CONVENIENCE FILTERS ─────────────────────────────────────

export function getNemeses(opponents: OpponentSummary[]): OpponentSummary[] {
  return opponents
    .filter((o) => o.badge === 'nemesis')
    .sort((a, b) => b.longestLossStreak - a.longestLossStreak);
}

export function getRivals(opponents: OpponentSummary[]): OpponentSummary[] {
  return opponents.filter((o) => o.badge === 'rival');
}

export function getOpponentByUsername(
  opponents: OpponentSummary[],
  username:  string,
): OpponentSummary | undefined {
  return opponents.find(
    (o) => o.username.toLowerCase() === username.toLowerCase(),
  );
}

// ─── REVENGE CANDIDATES ──────────────────────────────────────
// People who beat you when your ELO was lower than it is now.
// Their ELO hasn't improved as fast as yours — ripe for a rematch.

export function getRevengeCandidates(
  opponents:   OpponentSummary[],
  myCurrentElo: number,
): OpponentSummary[] {
  return opponents.filter((o) => {
    const theyBeatedMeBack  = o.losses > 0;
    const iWasLowerThen     = o.myEloAtFirst < myCurrentElo - 50;
    const theyHaventImproved = o.theirEloDelta < 100;
    const stillActive        = o.badge === 'nemesis' || o.badge === 'rival';

    return theyBeatedMeBack && iWasLowerThen && theyHaventImproved && stillActive;
  });
}