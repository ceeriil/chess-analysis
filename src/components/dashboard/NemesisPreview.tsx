// ============================================================
// ⬢ NEMESIS PREVIEW
// Top 3 nemesis cards on the dashboard.
// "See all" links to /nemeses.
// Server-safe — pure props.
// ============================================================

import Link               from 'next/link';
import { Badge }          from '@/components/ui/Badge';
import { DeltaPill }      from '@/components/ui/DeltaPill';
import { OpponentCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState }     from '@/components/ui/EmptyState';
import { PiSkullDuotone, PiCaretRight } from 'react-icons/pi';
import type { OpponentSummary } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

type NemesisPreviewProps = {
  nemeses:  OpponentSummary[];
  loading:  boolean;
  username: string;
  locale:   string;
};

// ─── SUB-COMPONENT ───────────────────────────────────────────

function NemesisCard({
  opponent,
  href,
}: {
  opponent: OpponentSummary;
  href:     string;
}) {
  return (
    <Link
      href={href}
      style={{ border: '1.5px solid #1A1A1A' }}
      className="flex flex-col gap-3.5 p-5 bg-[#1A1A1A] text-[#F8F3E8]
                 hover:bg-[#2C2C2A] transition-colors duration-150 no-underline"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold text-[#F8F3E8]"
          >
            {opponent.username}
          </p>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] text-[#9B9088] mt-0.5"
          >
            {opponent.totalGames} games · since{' '}
            {opponent.firstPlayedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
        <Badge variant="nemesis" />
      </div>

      {/* W/D/L */}
      <div
        style={{ border: '1.5px solid #3a3530' }}
        className="grid grid-cols-3"
      >
        {[
          { val: opponent.wins,   label: 'W', color: '#22AA44' },
          { val: opponent.draws,  label: 'D', color: '#9B9088' },
          { val: opponent.losses, label: 'L', color: '#CC2222' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{ borderRight: i < 2 ? '1.5px solid #3a3530' : 'none' }}
            className="flex flex-col items-center py-2"
          >
            <p
              style={{ fontFamily: "'Playfair Display', serif", color: s.color, lineHeight: '1' }}
              className="text-[20px] font-black"
            >
              {s.val}
            </p>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[9px] uppercase tracking-[0.1em] text-[#9B9088] mt-0.5"
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ELO + streak */}
      <div className="flex items-end justify-between">
        <div>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[9px] uppercase tracking-[0.1em] text-[#9B9088]"
          >
            Their ELO
          </p>
          <p
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
            className="text-[24px] font-black text-[#F8F3E8] mt-0.5"
          >
            {opponent.theirEloAtLast.toLocaleString()}
          </p>
        </div>
        {opponent.currentStreak.type === 'loss' && opponent.currentStreak.count > 0 && (
          <DeltaPill
            value={-opponent.currentStreak.count}
            label={`L${opponent.currentStreak.count} streak`}
          />
        )}
      </div>
    </Link>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export function NemesisPreview({
  nemeses,
  loading,
  username,
  locale,
}: NemesisPreviewProps) {
  const nemesisBase = `/${locale}/${username}/nemeses`;

  return (
    <section>
      {/* Section header */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2.5">
          <PiSkullDuotone size={14} className="text-[#CC2222]" />
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1A1A1A]"
          >
            Your Nemeses
          </p>
          {!loading && nemeses.length > 0 && (
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid #CC2222' }}
              className="text-[9px] font-semibold text-[#CC2222] px-1.5 py-0.5"
            >
              {nemeses.length}
            </span>
          )}
        </div>
        {nemeses.length > 0 && (
          <Link
            href={nemesisBase}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em]
                       uppercase text-[#9B9088] hover:text-[#1A1A1A]
                       transition-colors duration-150 no-underline"
          >
            See all <PiCaretRight size={11} />
          </Link>
        )}
      </div>

      {/* Cards */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <OpponentCardSkeleton key={i} />)}
          </div>
        ) : nemeses.length === 0 ? (
          <EmptyState
            icon={<PiSkullDuotone size={24} />}
            title="No nemeses yet"
            description="Play more games. They're coming."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nemeses.slice(0, 3).map((n) => (
              <NemesisCard
                key={n.username}
                opponent={n}
                href={`/${locale}/${username}/opponents/${n.username}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}