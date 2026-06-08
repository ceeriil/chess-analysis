// ============================================================
// ⬢ EMPTY STATE
// Used in tables and sections when there's no data.
// Server-safe.
//
// Usage:
//   <EmptyState
//     icon={<PiSword size={28} />}
//     title="No opponents found"
//     description="Play more games to start tracking opponents."
//     action={<Button size="sm">Search again</Button>}
//   />
// ============================================================

import type { ReactNode } from 'react';


type EmptyStateProps = {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center
                  py-16 px-8 gap-5 ${className}`}
    >
      {/* Icon box */}
      {icon && (
        <div
          style={{ border: '1.5px solid #C5C8B5' }}
          className="w-14 h-14 flex items-center justify-center text-[#9B9088]"
        >
          {icon}
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col gap-2 max-w-xs">
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#1A1A1A]"
        >
          {title}
        </p>
        {description && (
          <p
            style={{ fontFamily: "'Spectral', serif" }}
            className="text-[13px] text-[#9B9088] leading-[1.65]"
          >
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}