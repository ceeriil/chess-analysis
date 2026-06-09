'use client';

// ============================================================
// ⬢ [USERNAME] ERROR BOUNDARY
// Next.js error.tsx — catches runtime errors in the route.
// ============================================================

import { useEffect }    from 'react';
import { Button }       from '@/components/ui/Button';
import { PiWarning }    from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type ErrorProps = {
  error:  Error & { digest?: string };
  reset:  () => void;
};

// ─── COMPONENT ───────────────────────────────────────────────

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]
                    px-8 text-center gap-6">

      {/* Icon */}
      <div
        style={{ border: '1.5px solid #CC2222' }}
        className="w-14 h-14 flex items-center justify-center text-[#CC2222]"
      >
        <PiWarning size={26} />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2 max-w-sm">
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#1A1A1A]"
        >
          Something went wrong
        </p>
        <p
          style={{ fontFamily: "'Spectral', serif" }}
          className="text-[13px] text-[#9B9088] leading-[1.65]"
        >
          {error.message ?? 'An unexpected error occurred loading this analysis.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}