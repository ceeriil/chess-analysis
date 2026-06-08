// ============================================================
// ⬢ NAVBAR
// ============================================================

import Link from 'next/link';

type NavBarProps = {
  locale: string;
};


export function NavBar({ locale }: NavBarProps) {
  return (
    <nav
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="flex items-center justify-between px-7 h-[52px] bg-[#F8F3E8]"
    >
      <Link
        href={`/${locale}`}
        className="flex items-center gap-[10px] no-underline"
      >
        <div className="w-[26px] h-[26px] bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <KingIcon />
        </div>
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]"
        >
          Postmortem
        </span>
      </Link>

      <span
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[10px] tracking-[0.1em] uppercase text-[#9B9088] hidden sm:block"
      >
        Opponent Intelligence · Chess.com Analysis
      </span>

      <a
        href="#analyse"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          border: '1.5px solid #1A1A1A',
        }}
        className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]
                   px-4 py-2 hover:bg-[#1A1A1A] hover:text-[#F8F3E8] transition-colors duration-150"
      >
        Analyse →
      </a>
    </nav>
  );
}


function KingIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1V4M5 2.5H9M2 15H12L11 7H8.5L7 5L5.5 7H3L2 15Z"
        stroke="#F8F3E8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}