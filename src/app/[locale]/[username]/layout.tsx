// ============================================================
// ⬢ [USERNAME] LAYOUT
// src/app/[locale]/[username]/layout.tsx
// Wraps all dashboard pages in the AppShell.
// ============================================================

import { setRequestLocale } from 'next-intl/server';
import { AppShell }         from '@/components/layout/AppShell';
import type { ReactNode }   from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type LayoutProps = {
  children: ReactNode;
  params:   Promise<{ locale: string; username: string }>;
};

// ─── LAYOUT ──────────────────────────────────────────────────

export default async function UsernameLayout({ children, params }: LayoutProps) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  return (
    <AppShell username={username} locale={locale}>
      {children}
    </AppShell>
  );
}