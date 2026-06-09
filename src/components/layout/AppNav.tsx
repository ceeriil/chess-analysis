'use client';

// ============================================================
// ⬢ APP NAV — SIDEBAR
// Desktop: fixed left sidebar, 220px wide
// Shows: logo, nav links with active state, rank strip at bottom
// ============================================================

import Link      from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PiHouse,
  PiSword,
  PiSkullDuotone,
  PiChartLine,
  PiCaretRight,
} from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type AppNavProps = {
  username: string;
  locale:   string;
};

type NavItem = {
  label:  string;
  href:   string;
  icon:   typeof PiHouse;
  exact?:  boolean;
};

// ─── HELPERS ─────────────────────────────────────────────────

function buildNavItems(username: string, locale: string): NavItem[] {
  const base = `/${locale}/${username}`;
  return [
    { label: 'Dashboard',  href: base,                   icon: PiHouse,         exact: true },
    { label: 'Opponents',  href: `${base}/opponents`,     icon: PiSword               },
    { label: 'Nemeses',    href: `${base}/nemeses`,        icon: PiSkullDuotone        },
    { label: 'Tracking',   href: `${base}/tracking`,       icon: PiChartLine           },
  ];
}

// ─── COMPONENT ───────────────────────────────────────────────

export function AppNav({ username, locale }: AppNavProps) {
  const pathname  = usePathname();
  const navItems  = buildNavItems(username, locale);

  function isActive(item: NavItem) {
    return item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
  }

  return (
    <aside
      style={{ borderRight: '1.5px solid #1A1A1A' }}
      className="hidden lg:flex flex-col w-[220px] shrink-0 bg-[#F8F3E8]
                 sticky top-0 h-screen overflow-y-auto"
    >
      {/* ── Logo ── */}
      <Link
        href={`/${locale}`}
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="flex items-center gap-2.5 px-5 h-[52px] no-underline shrink-0
                   hover:bg-[#F0E8D8] transition-colors duration-150"
      >
        <div className="w-[22px] h-[22px] bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path
              d="M6 1V3M4.5 2H7.5M1.5 13H10.5L9.5 6.5H7.5L6 4.5L4.5 6.5H2.5L1.5 13Z"
              stroke="#F8F3E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#1A1A1A]"
        >
          Postmortem
        </span>
      </Link>

      {/* ── Username strip ── */}
      <div
        style={{ borderBottom: '1.5px solid #C5C8B5' }}
        className="px-5 py-3 shrink-0"
      >
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] mb-0.5"
        >
          Analysing
        </p>
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[12px] font-semibold text-[#1A1A1A] truncate"
        >
          {username}
        </p>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex flex-col flex-1 py-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon   = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={active ? { borderLeft: '2px solid #1A1A1A' } : { borderLeft: '2px solid transparent' }}
              className={`flex items-center justify-between gap-3 px-5 py-3
                         transition-colors duration-100 no-underline
                         ${active
                           ? 'bg-[#F0E8D8] text-[#1A1A1A]'
                           : 'text-[#9B9088] hover:text-[#1A1A1A] hover:bg-[#F0E8D8]'
                         }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} />
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-[11px] tracking-[0.08em] uppercase
                    ${active ? 'font-semibold' : 'font-medium'}`}
                >
                  {item.label}
                </span>
              </span>
              {active && <PiCaretRight size={11} className="text-[#9B9088]" />}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer — search another ── */}
      <div
        style={{ borderTop: '1.5px solid #C5C8B5' }}
        className="px-5 py-4 shrink-0"
      >
        <Link
          href={`/${locale}`}
          style={{ border: '1.5px solid #C5C8B5', fontFamily: "'IBM Plex Mono', monospace" }}
          className="flex items-center justify-center gap-2 w-full py-2
                     text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9B9088]
                     hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors duration-150"
        >
          Search another
        </Link>
      </div>
    </aside>
  );
}