// ============================================================
// ⬢ APP SHELL
// Layout wrapper for all dashboard pages.
// Server component — nav components are client islands.
// ============================================================

import { AppNav }       from '@/components/layout/AppNav';
import { AppNavMobile } from '@/components/layout/AppNavMobile';
import type { ReactNode } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type AppShellProps = {
  username: string;
  locale:   string;
  children: ReactNode;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function AppShell({ username, locale, children }: AppShellProps) {
  return (
    <div className="pm-page min-h-screen bg-[#F8F3E8] flex">

      {/* ── Desktop sidebar ── */}
      <AppNav username={username} locale={locale} />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col
                       pb-[56px] lg:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <AppNavMobile username={username} locale={locale} />
    </div>
  );
}