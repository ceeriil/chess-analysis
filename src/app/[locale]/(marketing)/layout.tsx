// ============================================================
// ⬢ ROOT LAYOUT
// src/app/[locale]/layout.tsx
// ============================================================

import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';


type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};


export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <>{children}</>;
}