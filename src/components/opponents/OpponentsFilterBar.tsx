'use client';

// ============================================================
// ⬢ OPPONENTS FILTER BAR
// Full filter/sort/search toolbar.
// Contains:
//   - Badge filter tabs with counts
//   - Text search
//   - Sort dropdown
//   - Active only toggle
//   - Table / Grid view toggle
//   - Reset button when filters are active
// ============================================================

import { PiMagnifyingGlass, PiSquaresFour, PiTable, PiX, PiFunnel } from 'react-icons/pi';
import { Input }    from '@/components/ui/Input';
import { Button }   from '@/components/ui/Button';
import type {
  OpponentSortKey,
  OpponentFilters,
} from '@/hooks/useOpponents';
import type { BadgeVariant } from '@/types';

// ─── TYPES ───────────────────────────────────────────────────

export type ViewMode = 'table' | 'grid';

type Counts = {
  all:            number;
  nemesis:        number;
  rival:          number;
  'punching-bag': number;
  dormant:        number;
  active:         number;
};

type OpponentsFilterBarProps = {
  counts:       Counts;
  filters:      OpponentFilters;
  search:       string;
  sort:         OpponentSortKey;
  viewMode:     ViewMode;
  resultCount:  number;
  setFilters:   (f: Partial<OpponentFilters>) => void;
  setSearch:    (s: string) => void;
  setSort:      (k: OpponentSortKey) => void;
  setViewMode:  (v: ViewMode) => void;
  resetFilters: () => void;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const BADGE_TABS: { key: BadgeVariant | 'all'; label: string }[] = [
  { key: 'all',          label: 'All'          },
  { key: 'nemesis',      label: 'Nemeses'      },
  { key: 'rival',        label: 'Rivals'       },
  { key: 'punching-bag', label: 'Punching Bags'},
  { key: 'active',       label: 'Active'       },
  { key: 'dormant',      label: 'Dormant'      },
];

const SORT_OPTIONS: { value: OpponentSortKey; label: string }[] = [
  { value: 'losses',     label: 'Most losses to them'  },
  { value: 'games',      label: 'Most games played'    },
  { value: 'wins',       label: 'Most wins against'    },
  { value: 'winRate',    label: 'Worst win rate first' },
  { value: 'lastPlayed', label: 'Recently played'      },
  { value: 'theirElo',   label: 'Highest ELO'          },
  { value: 'eloDelta',   label: 'Most improved'        },
];

// ─── COMPONENT ───────────────────────────────────────────────

export function OpponentsFilterBar({
  counts,
  filters,
  search,
  sort,
  viewMode,
  resultCount,
  setFilters,
  setSearch,
  setSort,
  setViewMode,
  resetFilters,
}: OpponentsFilterBarProps) {

  const hasActiveFilters =
    filters.badge !== 'all'
    || !!search.trim()
    || filters.activeOnly;

  return (
    <div
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="flex flex-col bg-[#F8F3E8]"
    >

      {/* ── Row 1: Badge tabs ── */}
      <div
        style={{ borderBottom: '1.5px solid #C5C8B5' }}
        className="flex items-center overflow-x-auto scrollbar-none"
      >
        {BADGE_TABS.map((tab, i) => {
          const count   = counts[tab.key as keyof Counts] ?? 0;
          const active  = filters.badge === tab.key;
          const isFirst = i === 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilters({ badge: tab.key as BadgeVariant | 'all' })}
              style={{
                fontFamily:  "'IBM Plex Mono', monospace",
                borderRight: '1.5px solid #C5C8B5',
                borderBottom: active ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: '-1px',
              }}
              className={`
                flex items-center gap-1.5 px-4 py-3 whitespace-nowrap
                text-[10px] font-semibold tracking-[0.1em] uppercase
                transition-colors duration-100 shrink-0 cursor-pointer border-t-0 border-l-0
                ${active
                  ? 'text-[#1A1A1A] bg-[#F8F3E8]'
                  : 'text-[#9B9088] bg-transparent hover:text-[#1A1A1A]'
                }
              `}
            >
              {tab.label}
              {count > 0 && (
                <span
                  style={{
                    fontFamily:  "'IBM Plex Mono', monospace",
                    border:      active ? '1.5px solid #1A1A1A' : '1.5px solid #C5C8B5',
                  }}
                  className={`text-[9px] px-1.5 py-0.5 ${active ? 'text-[#1A1A1A]' : 'text-[#9B9088]'}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Row 2: Search + sort + toggles ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0">

        {/* Search */}
        <div
          style={{ borderRight: '1.5px solid #C5C8B5' }}
          className="flex-1 relative"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9088] pointer-events-none">
            <PiMagnifyingGlass size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opponents…"
            spellCheck={false}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="w-full bg-transparent border-none outline-none
                       text-[12px] font-medium text-[#1A1A1A]
                       placeholder:text-[#9B9088] placeholder:font-normal
                       pl-10 pr-4 py-3"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9088] hover:text-[#1A1A1A]"
            >
              <PiX size={13} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div
          style={{ borderRight: '1.5px solid #C5C8B5' }}
          className="relative shrink-0"
        >
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as OpponentSortKey)}
            style={{
              fontFamily:        "'IBM Plex Mono', monospace",
              appearance:        'none',
              WebkitAppearance:  'none',
            }}
            className="bg-transparent border-none outline-none cursor-pointer
                       text-[10px] font-semibold tracking-[0.08em] uppercase
                       text-[#9B9088] hover:text-[#1A1A1A]
                       pl-4 pr-10 py-3 w-full sm:w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9088] pointer-events-none">
            <PiFunnel size={12} />
          </span>
        </div>

        {/* Active only toggle */}
        <button
          type="button"
          onClick={() => setFilters({ activeOnly: !filters.activeOnly })}
          style={{
            fontFamily:  "'IBM Plex Mono', monospace",
            borderRight: '1.5px solid #C5C8B5',
            background:  filters.activeOnly ? '#1A1A1A' : 'transparent',
            color:       filters.activeOnly ? '#F8F3E8' : '#9B9088',
          }}
          className="shrink-0 px-4 py-3 text-[10px] font-semibold tracking-[0.08em] uppercase
                     hover:text-[#1A1A1A] transition-colors duration-100 cursor-pointer border-none"
        >
          Active only
        </button>

        {/* View toggle */}
        <div
          style={{ borderRight: '1.5px solid #C5C8B5' }}
          className="flex shrink-0"
        >
          {(['table', 'grid'] as ViewMode[]).map((mode, i) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              style={{
                borderRight: i === 0 ? '1.5px solid #C5C8B5' : 'none',
                background:  viewMode === mode ? '#1A1A1A' : 'transparent',
                color:       viewMode === mode ? '#F8F3E8' : '#9B9088',
              }}
              className="flex items-center justify-center w-10 h-full
                         hover:text-[#1A1A1A] transition-colors duration-100
                         cursor-pointer border-none"
              aria-label={mode === 'table' ? 'Table view' : 'Grid view'}
            >
              {mode === 'table' ? <PiTable size={14} /> : <PiSquaresFour size={14} />}
            </button>
          ))}
        </div>

        {/* Result count + reset */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 ml-auto">
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] text-[#9B9088] whitespace-nowrap"
          >
            {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid #C5C8B5' }}
              className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em]
                         uppercase text-[#9B9088] hover:text-[#CC2222] hover:border-[#CC2222]
                         px-2 py-1 transition-colors duration-100 cursor-pointer bg-transparent"
            >
              <PiX size={11} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}