'use client';

// ============================================================
// ⬢ CTA BANNER
// ============================================================

import { useRouter } from 'next/navigation';
import { useState, type KeyboardEvent } from 'react';


type CtaBannerProps = {
  locale: string;
};

export function CtaBanner({ locale }: CtaBannerProps) {
  const router = useRouter();
  const [value,   setValue]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    const username = value.trim();
    if (!username) return;
    setLoading(true);
    router.push(`/${locale}/${username.toLowerCase()}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }


  return (
    <section
      style={{ borderBottom: '1.5px solid #1A1A1A' }}
      className="bg-[#F0E8D8] px-7 py-14 flex flex-col items-center text-center gap-7"
    >
      <p
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#9B9088]"
      >
        Free · No signup · Chess.com data only
      </p>

      <h2
        style={{ fontFamily: "'Playfair Display', serif", lineHeight: '0.93', letterSpacing: '-0.02em' }}
        className="text-[52px] sm:text-[64px] font-black text-[#1A1A1A] max-w-2xl"
      >
        Who has been<br />
        <em className="italic text-[#9B9088]">beating you?</em>
      </h2>

      <div className="w-full max-w-md flex flex-col gap-2">
        <div
          style={{ border: '1.5px solid #1A1A1A' }}
          className="flex"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your Chess.com username"
            maxLength={25}
            spellCheck={false}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium
                       text-[#1A1A1A] placeholder:text-[#9B9088] placeholder:font-normal
                       px-4 py-3.5 min-w-0"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="bg-[#1A1A1A] text-[#F8F3E8] text-[11px] font-semibold tracking-[0.12em]
                       uppercase px-5 border-none cursor-pointer shrink-0
                       hover:bg-[#CC2222] disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            {loading ? '…' : 'Go →'}
          </button>
        </div>
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#9B9088] text-left"
        >
          Enter your Chess.com username to generate your full opponent report.
        </p>
      </div>
    </section>
  );
}