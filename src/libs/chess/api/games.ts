// ============================================================
// ⬢ CHESS.COM API — GAMES
// Endpoints:
//   GET /pub/player/{username}/games/archives
//   GET /pub/player/{username}/games/{year}/{month}
//
// getArchives      — list of all month URLs
// getMonthlyGames  — games for a specific month
// getAllGames      — full history with progress callback
// ============================================================

import { chessGet }   from '@/utils/client';
import { cache }       from '@/utils/cache';
import {
  CACHE_TTL,
  classifyTimeControl,
  extractPgnHeader,
  getMonthsBetween,
  normaliseResult,
} from '@/constants';
import type {
  RawArchives,
  RawMonthlyGames,
  RawGame,
  ParsedGame,
  FetchGamesParams,
  MonthYear,
  TimeControl,
} from '@/types';

// ─── CACHE KEYS ──────────────────────────────────────────────

const keys = {
  archives: (u: string) =>
    `games:${u.toLowerCase()}:archives`,
  month: (u: string, year: number, month: number) =>
    `games:${u.toLowerCase()}:${year}:${String(month).padStart(2, '0')}`,
};

// ─── TRANSFORM ───────────────────────────────────────────────

function transformGame(raw: RawGame, username: string): ParsedGame {
  const u         = username.toLowerCase();
  const isWhite   = raw.white.username.toLowerCase() === u;
  const myPlayer  = isWhite ? raw.white : raw.black;
  const opponent  = isWhite ? raw.black : raw.white;

  const rawResult  = myPlayer.result;
  const result     = normaliseResult(rawResult);
  const timeControl = classifyTimeControl(raw.time_control);

  // Extract from PGN headers
  const opening     = extractPgnHeader(raw.pgn, 'Opening');
  const eco         = extractPgnHeader(raw.pgn, 'ECO');
  const termination = extractPgnHeader(raw.pgn, 'Termination');

  return {
    uuid:              raw.uuid,
    url:               raw.url,
    playedAt:          new Date(raw.end_time * 1000),
    timeControl,
    timeControlRaw:    raw.time_control,
    rated:             raw.rated,
    color:             isWhite ? 'white' : 'black',
    result,
    myRating:          myPlayer.rating,
    opponentRating:    opponent.rating,
    opponentUsername:  opponent.username.toLowerCase(),
    opening,
    eco,
    termination,
    pgn:               raw.pgn,
  };
}

// ─── API FUNCTIONS ───────────────────────────────────────────

export async function getArchives(username: string): Promise<MonthYear[]> {
  const key = keys.archives(username);

  return cache.getOrFetch(key, CACHE_TTL.ARCHIVES, async () => {
    const raw = await chessGet<RawArchives>(
      `/player/${username.toLowerCase()}/games/archives`,
    );

    return raw.archives.map((url) => {
      const parts = url.split('/');
      return {
        year:  parseInt(parts.at(-2) ?? '2020', 10),
        month: parseInt(parts.at(-1) ?? '1',    10),
      };
    });
  });
}

export async function getMonthlyGames(
  username: string,
  year:     number,
  month:    number,
): Promise<ParsedGame[]> {
  const key     = keys.month(username, year, month);
  const now     = new Date();
  const isCurrent =
    now.getFullYear() === year && now.getMonth() + 1 === month;

  // Past months: cache for 24h (they never change)
  // Current month: cache for 30min (new games arrive)
  const ttl = isCurrent ? CACHE_TTL.MONTHLY_GAMES : CACHE_TTL.PAST_MONTH;

  return cache.getOrFetch(key, ttl, async () => {
    const raw = await chessGet<RawMonthlyGames>(
      `/player/${username.toLowerCase()}/games/${year}/${String(month).padStart(2, '0')}`,
    );

    return raw.games
      .filter((g) => g.rules === 'chess')   // skip chess960 etc
      .map((g)  => transformGame(g, username));
  });
}

// ─── FULL HISTORY FETCHER ────────────────────────────────────
// Fetches all games across all months with:
//   - Optional date range filtering (avoids unnecessary requests)
//   - Optional time control filtering (post-fetch)
//   - Progress callback so the UI can show progress
//   - Sorted by most recent first

export type FetchAllGamesOptions = FetchGamesParams & {
  onProgress?: (fetched: number, total: number) => void;
};

export async function getAllGames(
  options: FetchAllGamesOptions,
): Promise<ParsedGame[]> {
  const { username, fromDate, toDate, timeControl, onProgress } = options;

  // 1. Get all archives
  let archives = await getArchives(username);

  // 2. Filter archives by date range (skip months we don't need)
  if (fromDate || toDate) {
    const from = fromDate ?? new Date(2007, 0, 1);  // Chess.com founded 2007
    const to   = toDate   ?? new Date();

    const needed = new Set(
      getMonthsBetween(from, to).map((m) => `${m.year}-${m.month}`),
    );

    archives = archives.filter(
      (a) => needed.has(`${a.year}-${a.month}`),
    );
  }

  // 3. Fetch months sequentially with progress
  const all: ParsedGame[] = [];
  const total = archives.length;

  for (let i = 0; i < archives.length; i++) {
    const { year, month } = archives[i]!;

    try {
      const games = await getMonthlyGames(username, year, month);
      all.push(...games);
    } catch {
      // Chess.com sometimes lists an archive month that returns 404 on fetch —
      // skip the broken month rather than aborting the entire history load.
    }

    onProgress?.(i + 1, total);
  }

  // 4. Filter by date range (exact)
  let filtered = all;
  if (fromDate) filtered = filtered.filter((g) => g.playedAt >= fromDate);
  if (toDate)   filtered = filtered.filter((g) => g.playedAt <= toDate);

  // 5. Filter by time control
  if (timeControl) {
    filtered = filtered.filter((g) => g.timeControl === timeControl);
  }

  // 6. Sort most recent first
  return filtered.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
}

// ─── RECENT GAMES SHORTCUT ───────────────────────────────────
// Last N months — common case for dashboard recent activity.

export async function getRecentGames(
  username: string,
  months:   number = 3,
  onProgress?: (fetched: number, total: number) => void,
): Promise<ParsedGame[]> {
  const to   = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);

  return getAllGames({ username, fromDate: from, toDate: to, onProgress });
}  