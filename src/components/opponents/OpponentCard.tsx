// ============================================================
// ⬢ OPPONENT CARD
// Full card for the grid view. Contains:
//   - Username + badge + online status
//   - H2H record with visual win rate bar
//   - ELO context: their current ELO + delta since you met
//   - "Met at" context: both ELOs at first game
//   - Current streak
//   - Top opening they played against you
//   - Revenge indicator if you've surpassed them
//   - Last played
// Server-safe — pure props.
// ============================================================

import Link         from 'next/link';
import { Badge }    from '@/components/ui/Badge';
import { DeltaPill } from '@/components/ui/DeltaPill';
import { Tooltip }  from '@/components/ui/Tooltip';
import { WinRateBar } from '@/components/opponents/WinRateBar';
import {
  PiSword,
  PiSkullDuotone,
  PiTrophy,
  PiArrowUp,
  PiClock,
  PiCaretRight,
} from 'react-icons/pi';
import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type OpponentCardProps = {
  opponent:     OpponentSummary;
  href:         string;
  myCurrentElo: number;
};

// ─── HELPERS ─────────────────────────────────────────────────

function formatLastPlayed(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0)  return 'Today';
  if (days === 1)  return 'Yesterday';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatStreak(streak: { type: 'win' | 'loss' | 'draw'; count: number }): {
  label: string;
  color: string;
} {
  if (streak.count === 0) return { label: '—', color: '#9B9088' };
  const prefix = streak.type === 'win' ? 'W' : streak.type === 'loss' ? 'L' : 'D';
  return {
    label: `${prefix}${streak.count}`,
    color: streak.type === 'win' ? '#22AA44' : streak.type === 'loss' ? '#CC2222' : '#9B9088',
  };
}

// ─── CARD BACKGROUNDS BY BADGE ───────────────────────────────

const CARD_BG: Record<string, string> = {
  nemesis:      'bg-[#1A1A1A]',
  rival:        'bg-[#F8F3E8]',
  'punching-bag': 'bg-[#F0FFF4]',
  active:       'bg-[#F8F3E8]',
  dormant:      'bg-[#F8F3E8]',
};

const CARD_BORDER: Record<string, string> = {
  nemesis:      '1.5px solid #3a3530',
  rival:        '1.5px solid #F0B429',
  'punching-bag': '1.5px solid #22AA44',
  active:       '1.5px solid #1A1A1A',
  dormant:      '1.5px solid #C5C8B5',
};

const IS_DARK = new Set(['nemesis']);

// ─── COMPONENT ───────────────────────────────────────────────

export function OpponentCard({ opponent, href, myCurrentElo }: OpponentCardProps) {
  const dark         = IS_DARK.has(opponent.badge);
  const streak       = formatStreak(opponent.currentStreak);
  const topOpening   = opponent.openingsAgainstMe[0];
  const isRevenge    = myCurrentElo > opponent.theirEloAtLast
                    && opponent.losses > 0
                    && opponent.badge !== 'punching-bag';
  const eloDeltaSign = opponent.theirEloDelta >= 0 ? '+' : '';

  const textPrimary   = dark ? 'text-[#F8F3E8]' : 'text-[#1A1A1A]';
  const textSecondary = dark ? 'text-[#9B9088]' : 'text-[#9B9088]';
  const borderColor   = dark ? '#3a3530'         : '#C5C8B5';

  return (
    <Link
      href={href}
      style={{ border: CARD_BORDER[opponent.badge] ?? '1.5px solid #1A1A1A' }}
      className={`
        flex flex-col gap-0 no-underline group
        ${CARD_BG[opponent.badge] ?? 'bg-[#F8F3E8]'}
        hover:brightness-[0.97] transition-all duration-150
      `}
    >

      {/* ── Header ── */}
      <div
        style={{ borderBottom: `1.5px solid ${borderColor}` }}
        className="flex items-start justify-between gap-2 px-4 py-3.5"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isRevenge && (
              <Tooltip content="You've surpassed their ELO — revenge opportunity" position="top">
                <span className="text-[#F0B429]">
                  <PiArrowUp size={12} />
                </span>
              </Tooltip>
            )}
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-[13px] font-semibold truncate ${textPrimary}`}
            >
              {opponent.username}
            </p>
          </div>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`text-[10px] ${textSecondary}`}
          >
            {opponent.totalGames} games · met{' '}
            {opponent.firstPlayedAt.toLocaleDateString('en-US', {
              month: 'short',
              year:  'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={opponent.badge} />
        </div>
      </div>

      {/* ── H2H record + bar ── */}
      <div
        style={{ borderBottom: `1.5px solid ${borderColor}` }}
        className="px-4 py-3"
      >
        {/* Big W/D/L numbers */}
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1', color: '#22AA44' }}
              className="text-[28px] font-black"
            >
              {opponent.wins}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-[10px] ${textSecondary}`}>W</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-[14px] ${textSecondary} mx-0.5`}>/</span>
            <span
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
              className={`text-[20px] font-bold ${textSecondary}`}
            >
              {opponent.draws}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-[10px] ${textSecondary}`}>D</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-[14px] ${textSecondary} mx-0.5`}>/</span>
            <span
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1', color: '#CC2222' }}
              className="text-[28px] font-black"
            >
              {opponent.losses}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-[10px] ${textSecondary}`}>L</span>
          </div>
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`text-[11px] font-semibold ${
              opponent.winRate >= 50 ? 'text-[#22AA44]' :
              opponent.winRate >= 35 ? (dark ? 'text-[#F8F3E8]' : 'text-[#1A1A1A]') :
              'text-[#CC2222]'
            }`}
          >
            {opponent.winRate}%
          </span>
        </div>

        {/* Visual bar */}
        <WinRateBar
          wins={opponent.wins}
          draws={opponent.draws}
          losses={opponent.losses}
          height={5}
        />
      </div>

      {/* ── ELO block ── */}
      <div
        style={{ borderBottom: `1.5px solid ${borderColor}` }}
        className="grid grid-cols-2 gap-0"
      >
        {/* Their current ELO */}
        <div
          style={{ borderRight: `1.5px solid ${borderColor}` }}
          className="px-4 py-3 flex flex-col gap-0.5"
        >
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${textSecondary}`}
          >
            Their ELO
          </p>
          <p
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
            className={`text-[22px] font-black ${textPrimary}`}
          >
            {opponent.theirEloAtLast.toLocaleString()}
          </p>
          <DeltaPill value={opponent.theirEloDelta} label={`${eloDeltaSign}${opponent.theirEloDelta} since meeting`} />
        </div>

        {/* Met at context */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <div>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${textSecondary} mb-0.5`}
            >
              You when met
            </p>
            <p
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
              className={`text-[16px] font-bold ${textPrimary}`}
            >
              {opponent.myEloAtFirst}
            </p>
          </div>
          <div>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${textSecondary} mb-0.5`}
            >
              Them when met
            </p>
            <p
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
              className={`text-[16px] font-bold ${textPrimary}`}
            >
              {opponent.theirEloAtFirst}
            </p>
          </div>
        </div>
      </div>

      {/* ── Streak + opening ── */}
      <div
        style={{ borderBottom: `1.5px solid ${borderColor}` }}
        className="grid grid-cols-2"
      >
        {/* Streak */}
        <div
          style={{ borderRight: `1.5px solid ${borderColor}` }}
          className="px-4 py-3 flex flex-col gap-0.5"
        >
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${textSecondary}`}
          >
            Current Streak
          </p>
          <p
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1', color: streak.color }}
            className="text-[22px] font-black"
          >
            {streak.label}
          </p>
        </div>

        {/* Top opening */}
        <div className="px-4 py-3 flex flex-col gap-0.5">
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${textSecondary}`}
          >
            vs You They Play
          </p>
          {topOpening ? (
            <>
              <p
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className={`text-[10px] font-semibold ${textPrimary} leading-tight`}
              >
                {topOpening.eco}
              </p>
              <p
                style={{ fontFamily: "'Spectral', serif" }}
                className={`text-[11px] italic ${textSecondary} leading-tight truncate`}
              >
                {topOpening.name}
              </p>
            </>
          ) : (
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-[10px] ${textSecondary}`}
            >
              —
            </p>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className={`flex items-center gap-1.5 text-[10px] ${textSecondary}`}
        >
          <PiClock size={11} />
          {formatLastPlayed(opponent.lastPlayedAt)}
        </span>
        <span className={`flex items-center gap-1 text-[10px] font-semibold
          ${textSecondary} group-hover:${dark ? 'text-[#F8F3E8]' : 'text-[#1A1A1A]'}
          transition-colors duration-150`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          View <PiCaretRight size={11} />
        </span>
      </div>

    </Link>
  );
}