// ============================================================
// ⬢ SKELETON
// Loading skeleton primitives.
// Server-safe — animation is pure CSS.
//
// Exports:
//   <Skeleton />             — single block (width/height configurable)
//   <OpponentCardSkeleton /> — full opponent card shimmer
//   <TableRowSkeleton />     — table row shimmer (pass colCount)
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────

type SkeletonProps = {
  width?:     string;
  height?:    string;
  className?: string;
};

type TableRowSkeletonProps = {
  colCount?: number;
  rows?:     number;
};

// ─── BASE SKELETON ───────────────────────────────────────────

export function Skeleton({ width = '100%', height = '16px', className = '' }: SkeletonProps) {
  return (
    <span
      style={{ width, height, display: 'block' }}
      className={`bg-[#E8E4DC] animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── OPPONENT CARD SKELETON ──────────────────────────────────

export function OpponentCardSkeleton() {
  return (
    <div
      style={{ border: '1.5px solid #C5C8B5' }}
      className="p-[22px] flex flex-col gap-4 animate-pulse"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="11px" width="40%" />
        </div>
        <Skeleton height="20px" width="52px" />
      </div>

      {/* W/D/L grid */}
      <div
        style={{ border: '1.5px solid #C5C8B5' }}
        className="grid grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ borderRight: i < 2 ? '1.5px solid #C5C8B5' : 'none' }}
            className="flex flex-col items-center gap-1.5 py-2.5"
          >
            <Skeleton height="20px" width="24px" />
            <Skeleton height="10px" width="28px" />
          </div>
        ))}
      </div>

      {/* ELO row */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton height="10px" width="80px" />
          <Skeleton height="26px" width="64px" />
        </div>
        <Skeleton height="20px" width="72px" />
      </div>
    </div>
  );
}

// ─── TABLE ROW SKELETON ──────────────────────────────────────

export function TableRowSkeleton({ colCount = 8, rows = 5 }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{ borderBottom: '1.5px solid #C5C8B5' }}
          className="flex items-center gap-4 px-7 py-3.5 animate-pulse"
          aria-hidden="true"
        >
          {Array.from({ length: colCount }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height="12px"
              width={colIdx === 0 ? '24px' : colIdx === 1 ? '140px' : '60px'}
              className="shrink-0"
            />
          ))}
        </div>
      ))}
    </>
  );
}