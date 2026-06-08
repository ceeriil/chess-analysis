'use client';

// ============================================================
// ⬢ TABLE
// TanStack Table v8 wrapper styled to the Postmortem design
// system. Handles: sorting, column visibility, empty state,
// loading skeleton, row hover.
//
// 
//
// Usage:
//   const columns = createColumns<Opponent>([
//     { id: 'name', header: 'Opponent', accessorKey: 'name' },
//     ...
//   ]);
//   <Table data={opponents} columns={columns} loading={isFetching} />
// ============================================================

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Row,
} from '@tanstack/react-table';
import { useState, type ReactNode } from 'react';
import { PiArrowUp, PiArrowDown, PiArrowsDownUp } from 'react-icons/pi';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState }       from '@/components/ui/EmptyState';
import { PiTable }          from 'react-icons/pi';


type TableProps<TData> = {
  data:          TData[];
  columns:       ColumnDef<TData, any>[];
  loading?:      boolean;
  skeletonRows?: number;
  emptyTitle?:   string;
  emptyDesc?:    string;
  emptyIcon?:    ReactNode;
  emptyAction?:  ReactNode;
  onRowClick?:   (row: Row<TData>) => void;
  className?:    string;
  label?:        string;
  labelRight?:   string;
};


export function Table<TData>({
  data,
  columns,
  loading        = false,
  skeletonRows   = 5,
  emptyTitle     = 'No data',
  emptyDesc,
  emptyIcon,
  emptyAction,
  onRowClick,
  className      = '',
  label,
  labelRight,
}: TableProps<TData>) {


  const [sorting, setSorting] = useState<SortingState>([]);


  const table = useReactTable({
    data,
    columns,
    state:          { sorting },
    onSortingChange: setSorting,
    getCoreRowModel:    getCoreRowModel(),
    getSortedRowModel:  getSortedRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const rows         = table.getRowModel().rows;
  const isEmpty      = !loading && rows.length === 0;

  // ── Render ──

  return (
    <div
      style={{ border: '1.5px solid #1A1A1A' }}
      className={`bg-[#F8F3E8] ${className}`}
    >

      {/* Section label */}
      {(label || labelRight) && (
        <div
          style={{ borderBottom: '1.5px solid #C5C8B5' }}
          className="flex items-center justify-between px-7 py-3"
        >
          {label && (
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088]"
            >
              {label}
            </p>
          )}
          {labelRight && (
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[9px] tracking-[0.1em] uppercase text-[#9B9088]"
            >
              {labelRight}
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Head */}
          <thead>
            {headerGroups.map((hg) => (
              <tr
                key={hg.id}
                style={{ borderBottom: '1.5px solid #C5C8B5' }}
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted  = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      className={`
                        text-left text-[9px] font-semibold tracking-[0.12em] uppercase
                        text-[#9B9088] px-4 py-2.5 whitespace-nowrap select-none
                        first:pl-7 last:pr-7
                        ${canSort ? 'cursor-pointer hover:text-[#1A1A1A] transition-colors duration-100' : ''}
                      `}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-[#C5C8B5]">
                            {sorted === 'asc'  && <PiArrowUp size={11} className="text-[#1A1A1A]" />}
                            {sorted === 'desc' && <PiArrowDown size={11} className="text-[#1A1A1A]" />}
                            {!sorted           && <PiArrowsDownUp size={11} />}
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
            {loading ? (
              /* Skeleton rows */
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableRowSkeleton
                    colCount={columns.length}
                    rows={skeletonRows}
                  />
                </td>
              </tr>
            ) : isEmpty ? (
              /* Empty state */
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon ?? <PiTable size={26} />}
                    title={emptyTitle}
                    description={emptyDesc}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              /* Data rows */
              rows.map((row, i) => {
                const isLast = i === rows.length - 1;
                return (
                  <tr
                    key={row.id}
                    style={{ borderBottom: isLast ? 'none' : '1.5px solid #C5C8B5' }}
                    className={`
                      ${onRowClick
                        ? 'cursor-pointer hover:bg-[#F0E8D8] transition-colors duration-100'
                        : 'hover:bg-[#F0E8D8] transition-colors duration-100'}
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        className="text-[12px] text-[#1A1A1A] px-4 py-3
                                   first:pl-7 last:pr-7 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}