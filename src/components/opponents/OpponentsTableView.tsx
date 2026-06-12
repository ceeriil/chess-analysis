'use client';

// ============================================================
// ⬢ OPPONENTS TABLE VIEW
// TanStack Table v8 — full opponents list.
// Columns:
//   rank · opponent + badge · H2H bar · win% · their ELO + delta
//   streak · met at · last played · games · →
// Sorting handled by useOpponents hook (passed in, not internal).
// ============================================================

import { useRouter }     from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  PiArrowUp,
  PiArrowDown,
  PiArrowsDownUp,
  PiCaretRight,
} from 'react-icons/pi';

import { Badge }      from '@/components/ui/Badge';
import { DeltaPill }  from '@/components/ui/DeltaPill';
import { Tooltip }    from '@/components/ui/Tooltip';
import { WinRateBar } from '@/components/opponents/WinRateBar';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PiSword }    from 'react-icons/pi';

import type { OpponentSummary }          from '@/types';
import type { OpponentSortKey, OpponentSortDir } from '@/hooks/useOpponents';

// ─── TYPES ───────────────────────────────────────────────────

type OpponentsTableViewProps = {
  opponents:    OpponentSummary[];
  loading:      boolean;
  username:     string;
  locale:       string;
  myCurrentElo: number;
  sort:         OpponentSortKey;
  sortDir:      OpponentSortDir;
  onSort:       (key: OpponentSortKey) => void;
};

// ─── HELPERS ─────────────────────────────────────────────────

function formatLastPlayed(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0)  return 'Today';
  if (days === 1)  return 'Yesterday';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// Map table column id → sort key
const COL_SORT_MAP: Partial<Record<string, OpponentSortKey>> = {
  opponent:    undefined,   // not sortable
  h2h:         'winRate',
  theirElo:    'theirElo',
  streak:      undefined,
  metAt:       undefined,
  lastPlayed:  'lastPlayed',
  games:       'games',
};

// ─── COLUMN HELPER ───────────────────────────────────────────

const col = createColumnHelper<OpponentSummary>();

// ─── COMPONENT ───────────────────────────────────────────────

export function OpponentsTableView({
  opponents,
  loading,
  username,
  locale,
  myCurrentElo,
  sort,
  sortDir,
  onSort,
}: OpponentsTableViewProps) {
  const router = useRouter();

  // ── Column definitions ──

  const columns = [
    // Rank
    col.display({
      id:     'rank',
      header: '#',
      cell:   (info) => (
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#9B9088]"
        >
          {info.row.index + 1}
        </span>
      ),
    }),

    // Opponent name + badge + revenge indicator
    col.accessor('username', {
      id:     'opponent',
      header: 'Opponent',
      cell:   (info) => {
        const opp        = info.row.original;
        const isRevenge  = myCurrentElo > opp.theirEloAtLast && opp.losses > 0;
        return (
          <div className="flex items-center gap-2 min-w-0">
            {isRevenge && (
              <Tooltip content="Revenge candidate — you've surpassed their ELO" position="right">
                <span className="text-[#F0B429] shrink-0">
                  <PiArrowUp size={11} />
                </span>
              </Tooltip>
            )}
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[12px] font-semibold text-[#1A1A1A] truncate"
            >
              {opp.username}
            </span>
            <Badge variant={opp.badge} />
          </div>
        );
      },
    }),

    // H2H: visual bar + W/D/L + win%
    col.display({
      id:     'h2h',
      header: 'H2H',
      cell:   (info) => {
        const opp = info.row.original;
        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <WinRateBar
              wins={opp.wins}
              draws={opp.draws}
              losses={opp.losses}
              height={4}
            />
            <div className="flex items-center gap-1">
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-[10px] font-semibold text-[#22AA44]"
              >
                {opp.wins}W
              </span>
              {opp.draws > 0 && (
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[10px] text-[#9B9088]"
                >
                  {opp.draws}D
                </span>
              )}
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-[10px] font-semibold text-[#CC2222]"
              >
                {opp.losses}L
              </span>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className={`text-[10px] ml-1 font-semibold
                  ${opp.winRate >= 50 ? 'text-[#22AA44]' : opp.winRate === 0 ? 'text-[#CC2222]' : 'text-[#9B9088]'}`}
              >
                {opp.winRate}%
              </span>
            </div>
          </div>
        );
      },
    }),

    // Their ELO + delta
    col.display({
      id:     'theirElo',
      header: 'Their ELO',
      cell:   (info) => {
        const opp = info.row.original;
        return (
          <div className="flex flex-col gap-1">
            <span
              style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
              className="text-[16px] font-bold text-[#1A1A1A]"
            >
              {opp.theirEloAtLast.toLocaleString()}
            </span>
            <DeltaPill value={opp.theirEloDelta} />
          </div>
        );
      },
    }),

    // Current streak
    col.display({
      id:     'streak',
      header: 'Streak',
      cell:   (info) => {
        const opp    = info.row.original;
        const s      = opp.currentStreak;
        if (s.count === 0) return (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] text-[#C5C8B5]">—</span>
        );
        const prefix = s.type === 'win' ? 'W' : s.type === 'loss' ? 'L' : 'D';
        const color  = s.type === 'win' ? '#22AA44' : s.type === 'loss' ? '#CC2222' : '#9B9088';
        return (
          <span
            style={{ fontFamily: "'Playfair Display', serif", color, lineHeight: '1' }}
            className="text-[18px] font-black"
          >
            {prefix}{s.count}
          </span>
        );
      },
    }),

    // Met at — my ELO / their ELO when first played
    col.display({
      id:     'metAt',
      header: 'Met At',
      cell:   (info) => {
        const opp = info.row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] text-[#9B9088]"
            >
              You: {opp.myEloAtFirst}
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10px] text-[#9B9088]"
            >
              Them: {opp.theirEloAtFirst}
            </span>
          </div>
        );
      },
    }),

    // Last played
    col.accessor('lastPlayedAt', {
      id:     'lastPlayed',
      header: 'Last Played',
      cell:   (info) => (
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#9B9088] whitespace-nowrap"
        >
          {formatLastPlayed(info.getValue())}
        </span>
      ),
    }),

    // Total games
    col.accessor('totalGames', {
      id:     'games',
      header: 'Games',
      cell:   (info) => (
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[12px] text-[#1A1A1A] font-medium"
        >
          {info.getValue()}
        </span>
      ),
    }),

    // Arrow — navigate to detail
    col.display({
      id:   'action',
      header: '',
      cell: () => (
        <PiCaretRight size={13} className="text-[#C5C8B5] group-hover:text-[#1A1A1A] transition-colors" />
      ),
    }),
  ];

  // ── Table instance (sorting handled externally by useOpponents) ──

  const table = useReactTable({
    data:            opponents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting:   true,   // sorting done in useOpponents hook
  });

  // ── Render ──

  if (loading) {
    return (
      <div style={{ border: '1.5px solid #1A1A1A' }}>
        <TableRowSkeleton colCount={9} rows={10} />
      </div>
    );
  }

  if (opponents.length === 0) {
    return (
      <EmptyState
        icon={<PiSword size={26} />}
        title="No opponents match"
        description="Try adjusting your filters or search query."
      />
    );
  }

  const SORTABLE: OpponentSortKey[] = ['winRate', 'theirElo', 'lastPlayed', 'games'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ border: '1.5px solid #1A1A1A' }}>

        {/* Head */}
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              style={{ borderBottom: '1.5px solid #C5C8B5', background: '#F0E8D8' }}
            >
              {hg.headers.map((header) => {
                const sortKey = COL_SORT_MAP[header.id] as OpponentSortKey | undefined;
                const canSort = !!sortKey;
                const isSorted = sort === sortKey;

                return (
                  <th
                    key={header.id}
                    onClick={() => canSort && onSort(sortKey!)}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className={`
                      text-left text-[9px] font-semibold tracking-[0.12em] uppercase
                      text-[#9B9088] px-4 py-3 whitespace-nowrap select-none
                      first:pl-6 last:pr-6
                      ${canSort ? 'cursor-pointer hover:text-[#1A1A1A] transition-colors duration-100' : ''}
                    `}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-[#C5C8B5]">
                          {isSorted && sortDir === 'asc'  ? <PiArrowUp size={10} className="text-[#1A1A1A]" />   :
                           isSorted && sortDir === 'desc' ? <PiArrowDown size={10} className="text-[#1A1A1A]" /> :
                           <PiArrowsDownUp size={10} />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {table.getRowModel().rows.map((row, i) => {
            const isLast = i === opponents.length - 1;
            const opp    = row.original;

            return (
              <tr
                key={row.id}
                style={{ borderBottom: isLast ? 'none' : '1.5px solid #C5C8B5' }}
                className="group cursor-pointer hover:bg-[#F0E8D8] transition-colors duration-100"
                onClick={() =>
                  router.push(`/${locale}/${username}/opponents/${opp.username}`)
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 first:pl-6 last:pr-6 align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}