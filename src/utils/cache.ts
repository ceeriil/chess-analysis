// ============================================================
// ⬢ CACHE
// localStorage cache with TTL + versioning.
// Safe to call server-side (no-ops if window is undefined).
//
// Usage:
//   cache.set('player:magnus', data, CACHE_TTL.PLAYER_PROFILE);
//   cache.get<Player>('player:magnus');  // null if missing/expired
//   cache.clear('player:magnus');
//   cache.clearByPrefix('player:');
// ============================================================

import { CACHE_PREFIX } from '../constants';

// ─── TYPES ───────────────────────────────────────────────────

type CacheEntry<T> = {
  data:      T;
  expiresAt: number;   // Unix ms timestamp
  version:   number;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const CACHE_VERSION = 1;  // bump to invalidate all existing cache

// ─── HELPERS ─────────────────────────────────────────────────

function isAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function buildKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

// ─── CACHE OBJECT ────────────────────────────────────────────

export const cache = {

  // ── Get ──
  get<T>(key: string): T | null {
    if (!isAvailable()) return null;

    try {
      const raw = localStorage.getItem(buildKey(key));
      if (!raw) return null;

      const entry = JSON.parse(raw) as CacheEntry<T>;

      // Version mismatch — treat as miss
      if (entry.version !== CACHE_VERSION) {
        cache.clear(key);
        return null;
      }

      // Expired
      if (Date.now() > entry.expiresAt) {
        cache.clear(key);
        return null;
      }

      return entry.data;
    } catch {
      // Corrupt data — clear it
      cache.clear(key);
      return null;
    }
  },

  // ── Set ──
  set<T>(key: string, data: T, ttlMs: number): void {
    if (!isAvailable()) return;

    try {
      const entry: CacheEntry<T> = {
        data,
        expiresAt: Date.now() + ttlMs,
        version:   CACHE_VERSION,
      };
      localStorage.setItem(buildKey(key), JSON.stringify(entry));
    } catch (e) {
      // localStorage quota exceeded — clear old entries and retry once
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        cache.clearAll();
        try {
          const entry: CacheEntry<T> = {
            data,
            expiresAt: Date.now() + ttlMs,
            version:   CACHE_VERSION,
          };
          localStorage.setItem(buildKey(key), JSON.stringify(entry));
        } catch {
          // Give up silently — cache is non-critical
        }
      }
    }
  },

  // ── Clear single key ──
  clear(key: string): void {
    if (!isAvailable()) return;
    localStorage.removeItem(buildKey(key));
  },

  // ── Clear by prefix ──
  clearByPrefix(prefix: string): void {
    if (!isAvailable()) return;

    const fullPrefix = buildKey(prefix);
    const toDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(fullPrefix)) toDelete.push(k);
    }

    toDelete.forEach((k) => localStorage.removeItem(k));
  },

  // ── Clear all postmortem cache ──
  clearAll(): void {
    if (!isAvailable()) return;
    cache.clearByPrefix('');
  },

  // ── Check if key exists and is fresh ──
  has(key: string): boolean {
    return cache.get(key) !== null;
  },

  // ── Get or fetch — the main pattern ──
  // If cache miss, calls fetcher, stores result, returns it.
  async getOrFetch<T>(
    key:     string,
    ttlMs:   number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    cache.set(key, fresh, ttlMs);
    return fresh;
  },
};