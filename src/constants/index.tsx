// ============================================================
// ⬢ CHESS.COM API — CONSTANTS
// ============================================================

import type { GameResult, TimeControl } from '@/types';

// ─── API ─────────────────────────────────────────────────────

export const CHESS_API_BASE = 'https://api.chess.com/pub';

export const CHESS_API_HEADERS = {
  // Chess.com requests a descriptive User-Agent
  'User-Agent': 'Postmortem Chess Analyser (https://postmortem.gg; contact@postmortem.gg)',
};

// ─── RATE LIMITING ───────────────────────────────────────────
// Chess.com doesn't publish exact limits but in practice:
// - ~1 req/sec sustained is safe
// - Burst of ~5 is fine
// - Archives + monthly games = many requests for active players

export const RATE_LIMIT = {
  MIN_INTERVAL_MS:    250,   // min ms between requests
  MAX_CONCURRENT:     3,     // max parallel requests
  RETRY_DELAY_MS:     2000,  // delay after a 429
  MAX_RETRIES:        3,
} as const;

// ─── CACHE TTLs (ms) ─────────────────────────────────────────

export const CACHE_TTL = {
  PLAYER_PROFILE:  60 * 60 * 1000,          // 1 hour
  PLAYER_STATS:    30 * 60 * 1000,          // 30 min
  ONLINE_STATUS:   2 * 60 * 1000,           // 2 min (changes fast)
  MONTHLY_GAMES:   30 * 60 * 1000,          // 30 min (current month)
  PAST_MONTH:      24 * 60 * 60 * 1000,     // 24 hours (past months never change)
  ARCHIVES:        60 * 60 * 1000,          // 1 hour
} as const;

export const CACHE_PREFIX = 'postmortem:v1:';

// ─── CLASSIFICATION THRESHOLDS ───────────────────────────────

export const NEMESIS_THRESHOLD = {
  MIN_GAMES:         3,      // must have played at least this many games
  MIN_LOSS_RATE:     0.60,   // they beat you >= 60% of the time
  MIN_LOSSES:        3,      // must have lost to them at least 3 times
} as const;

export const RIVAL_THRESHOLD = {
  MIN_GAMES:         4,      // must have played at least 4 games
  MIN_WIN_RATE:      0.35,   // you win at least 35% (contested)
  MAX_WIN_RATE:      0.65,   // but not more than 65% (otherwise punching bag)
} as const;

export const PUNCHING_BAG_THRESHOLD = {
  MIN_GAMES:         3,
  MIN_WIN_RATE:      0.70,   // you beat them >= 70% of the time
} as const;

export const DORMANT_THRESHOLD_DAYS = 90;  // last game > 90 days ago

// ─── RESULT NORMALISATION ────────────────────────────────────
// Chess.com uses string results like "win", "checkmated", "resigned"
// from the perspective of each player's object.

// Results that mean YOU WON (when in your player object)
export const WIN_RESULTS = new Set<string>([
  'win',
]);

// Results that mean YOU LOST
export const LOSS_RESULTS = new Set<string>([
  'checkmated',
  'timeout',
  'resigned',
  'lose',
  'abandoned',
]);

// Results that mean DRAW
export const DRAW_RESULTS = new Set<string>([
  'agreed',
  'repetition',
  'stalemate',
  'insufficient',
  'timevsinsufficient',
  '50move',
]);

export function normaliseResult(raw: string): GameResult {
  if (WIN_RESULTS.has(raw))  return 'win';
  if (LOSS_RESULTS.has(raw)) return 'loss';
  if (DRAW_RESULTS.has(raw)) return 'draw';
  return 'unknown';
}

// ─── TIME CONTROL CLASSIFICATION ─────────────────────────────

export function classifyTimeControl(raw: string): TimeControl {
  // Daily games use formats like "1/86400"
  if (raw.includes('/')) return 'daily';

  // Extract base seconds (before any "+increment")
  const base = parseInt(raw.split('+')[0] ?? '0', 10);

  if (base >= 600) return 'rapid';    // 10+ min
  if (base >= 180) return 'blitz';    // 3–9 min
  if (base >  0)   return 'bullet';   // < 3 min
  return 'unknown';
}

// ─── PGN HEADER EXTRACTION ───────────────────────────────────

export function extractPgnHeader(pgn: string, key: string): string | null {
  const match = pgn.match(new RegExp(`\\[${key} "([^"]*)"\\]`));
  return match?.[1] ?? null;
}

// ─── DATE UTILITIES ──────────────────────────────────────────

export function getMonthsBetween(from: Date, to: Date): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end    = new Date(to.getFullYear(),   to.getMonth(),   1);

  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

export function extractCountryCode(countryUrl: string): string {
  // "https://api.chess.com/pub/country/NG" → "NG"
  return countryUrl.split('/').pop() ?? 'XX';
}