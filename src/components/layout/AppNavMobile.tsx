'use client';

// ============================================================
// ⬢ APP NAV MOBILE — BOTTOM TAB BAR
// Mobile only (lg:hidden). Fixed bottom tab bar.
// ============================================================

import Link           from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  PiHouse,
  PiSword,
  PiSkullDuotone,
  PiChartLine,
} from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type AppNavMobileProps = {
  username: string;
  locale:   string;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function AppNavMobile({ username, locale }: AppNavMobileProps) {
  const pathname = usePathname();
  const base     = `/${locale}/${username}`;

type Tab = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  exact: boolean;
};

  const tabs: Tab[] = [
    { label: 'Home',      href: base,                   icon: PiHouse,        exact: true },
    { label: 'Opponents', href: `${base}/opponents`,     icon: PiSword,        exact: false },
    { label: 'Nemeses',   href: `${base}/nemeses`,        icon: PiSkullDuotone, exact: false },
    { label: 'Tracking',  href: `${base}/tracking`,       icon: PiChartLine,    exact: false },
  ];

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav
      style={{ borderTop: '1.5px solid #1A1A1A' }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                 bg-[#F8F3E8] grid grid-cols-4 h-[56px]"
    >
      {tabs.map((tab, i) => {
        const active = isActive(tab.href, tab.exact);
        const Icon   = tab.icon;
        const isLast = i === tabs.length - 1;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{ borderRight: isLast ? 'none' : '1.5px solid #C5C8B5' }}
            className={`flex flex-col items-center justify-center gap-1
                       transition-colors duration-100 no-underline
                       ${active ? 'bg-[#F0E8D8] text-[#1A1A1A]' : 'text-[#9B9088]'}`}
          >
            <Icon size={18} />
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-[9px] tracking-[0.08em] uppercase
                ${active ? 'font-semibold text-[#1A1A1A]' : 'font-medium'}`}
            >
              {tab.label}
            </span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2
                               w-6 h-[2px] bg-[#1A1A1A]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}