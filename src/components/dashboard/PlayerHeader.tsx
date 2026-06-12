// ============================================================
// ⬢ PLAYER HEADER
// Top section of dashboard — profile identity block.
// Server-safe (no hooks, pure props).
// ============================================================

import { PiCircle, PiGlobe } from 'react-icons/pi';
import type { Player, PlayerStats } from '@/types';
import type { TimeControlOption }   from '@/components/dashboard/TimeControlSelector';

// ─── TYPES ───────────────────────────────────────────────────

type PlayerHeaderProps = {
  player:      Player;
  stats:       PlayerStats;
  timeControl: TimeControlOption;
  loading?:    boolean;
};

// ─── HELPERS ─────────────────────────────────────────────────

function formatJoined(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function getActiveRating(stats: PlayerStats, tc: TimeControlOption) {
  if (tc === 'all' || tc === 'rapid')  return stats.rapid;
  if (tc === 'blitz')                  return stats.blitz;
  if (tc === 'bullet')                 return stats.bullet;
  return stats.rapid;
}

// ─── COMPONENT ───────────────────────────────────────────────

export function PlayerHeader({ player, stats, timeControl }: PlayerHeaderProps) {
  const rating = getActiveRating(stats, timeControl);

  return (
    <div
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="flex flex-col sm:flex-row items-start sm:items-center
                 justify-between gap-5 px-6 py-5 bg-[#F8F3E8]"
    >
      {/* ── Left: identity ── */}
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div
          style={{ border: '1.5px solid #1A1A1A' }}
          className="w-14 h-14 shrink-0 overflow-hidden bg-[#F0E8D8] flex items-center justify-center"
        >
          {player.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatar}
              alt={player.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-[22px] font-black text-[#9B9088] select-none"
            >
              {player.username[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title badge */}
            {player.title && (
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  border:     '1.5px solid #F0B429',
                }}
                className="text-[9px] font-semibold tracking-[0.1em] uppercase
                           text-[#F0B429] px-1.5 py-0.5"
              >
                {player.title}
              </span>
            )}
            <h1
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[16px] font-semibold text-[#1A1A1A]"
            >
              {player.username}
            </h1>
            {/* Online indicator */}
            <span className="flex items-center gap-1">
              <PiCircle
                size={8}
                className={player.isOnline ? 'text-[#22AA44] fill-[#22AA44]' : 'text-[#C5C8B5] fill-[#C5C8B5]'}
              />
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-[10px] text-[#9B9088]"
              >
                {player.isOnline ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="flex items-center gap-1 text-[10px] text-[#9B9088]"
            >
              <PiGlobe size={11} />
              {player.countryCode}
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] text-[#9B9088]"
            >
              Joined {formatJoined(player.joined)}
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] text-[#9B9088]"
            >
              {player.followers.toLocaleString()} followers
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: current ELO hero number ── */}
      {rating && (
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088]"
          >
            {timeControl === 'all' ? 'Rapid' : timeControl} Rating
          </p>
          <p
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
            className="text-[48px] font-black text-[#1A1A1A]"
          >
            {rating.current.toLocaleString()}
          </p>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] text-[#9B9088]"
          >
            Best: {rating.best.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}