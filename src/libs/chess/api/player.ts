// ============================================================
// ⬢ CHESS.COM API — PLAYER
// Endpoints:
//   GET /pub/player/{username}
//   GET /pub/player/{username}/stats
//   GET /pub/player/{username}/is-online
// ============================================================

import { chessGet }          from '@/utils/client';
import { cache }              from '@/utils/cache';
import { CACHE_TTL, extractCountryCode } from '@/constants';
import type {
  RawPlayer,
  RawPlayerStats,
  RawOnlineStatus,
  RawRatingCategory,
  Player,
  PlayerStats,
  PlayerRating,
} from '@/types';

// ─── CACHE KEYS ──────────────────────────────────────────────

const keys = {
  profile: (u: string) => `player:${u.toLowerCase()}:profile`,
  stats:   (u: string) => `player:${u.toLowerCase()}:stats`,
  online:  (u: string) => `player:${u.toLowerCase()}:online`,
};

// ─── TRANSFORMS ──────────────────────────────────────────────

function transformPlayer(raw: RawPlayer): Player {
  return {
    username:    raw.username,
    displayName: raw.name ?? raw.username,
    avatar:      raw.avatar ?? null,
    countryCode: extractCountryCode(raw.country),
    joined:      new Date(raw.joined * 1000),
    lastOnline:  new Date(raw.last_online * 1000),
    isOnline:    false,   // filled in separately by getOnlineStatus
    status:      raw.status,
    title:       raw.title ?? null,
    profileUrl:  raw.url,
    followers:   raw.followers,
  };
}

function transformRatingCategory(raw: RawRatingCategory): PlayerRating {
  const total = raw.record.win + raw.record.loss + raw.record.draw;

  return {
    current:  raw.last.rating,
    best:     raw.best.rating,
    bestDate: new Date(raw.best.date * 1000),
    wins:     raw.record.win,
    losses:   raw.record.loss,
    draws:    raw.record.draw,
    winRate:  total > 0
      ? Math.round((raw.record.win / total) * 100)
      : 0,
  };
}

function transformStats(raw: RawPlayerStats): PlayerStats {
  return {
    rapid:  raw.chess_rapid  ? transformRatingCategory(raw.chess_rapid)  : null,
    blitz:  raw.chess_blitz  ? transformRatingCategory(raw.chess_blitz)  : null,
    bullet: raw.chess_bullet ? transformRatingCategory(raw.chess_bullet) : null,
    daily:  raw.chess_daily  ? transformRatingCategory(raw.chess_daily)  : null,
  };
}

// ─── API FUNCTIONS ───────────────────────────────────────────

export async function getPlayer(username: string): Promise<Player> {
  const key = keys.profile(username);

  return cache.getOrFetch(key, CACHE_TTL.PLAYER_PROFILE, async () => {
    const raw = await chessGet<RawPlayer>(`/player/${username.toLowerCase()}`);
    return transformPlayer(raw);
  });
}

export async function getPlayerStats(username: string): Promise<PlayerStats> {
  const key = keys.stats(username);

  return cache.getOrFetch(key, CACHE_TTL.PLAYER_STATS, async () => {
    const raw = await chessGet<RawPlayerStats>(`/player/${username.toLowerCase()}/stats`);
    return transformStats(raw);
  });
}

export async function getOnlineStatus(username: string): Promise<boolean> {
  const key = keys.online(username);

  return cache.getOrFetch(key, CACHE_TTL.ONLINE_STATUS, async () => {
    const raw = await chessGet<RawOnlineStatus>(
      `/player/${username.toLowerCase()}/is-online`,
    );
    return raw.online;
  });
}

// ─── COMBINED FETCH ──────────────────────────────────────────
// Fetches profile + stats + online in parallel.
// This is the standard entry point for the dashboard.

export async function getPlayerFull(username: string): Promise<{
  player:   Player;
  stats:    PlayerStats;
  isOnline: boolean;
}> {
  const [player, stats, isOnline] = await Promise.all([
    getPlayer(username),
    getPlayerStats(username),
    getOnlineStatus(username),
  ]);

  return { player: { ...player, isOnline }, stats, isOnline };
}