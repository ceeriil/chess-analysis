'use client';

// ============================================================
// ⬢ USERNAME INPUT
// Client island — handles input state + navigation
// ============================================================

import { useRouter } from 'next/navigation';
import { useState, type KeyboardEvent, type FormEvent } from 'react';

// ─── TYPES ───────────────────────────────────────────────────

type UsernameInputProps = {
  locale: string;
};

// ─── COMPONENT ───────────────────────────────────────────────

export function UsernameInput({ locale }: UsernameInputProps) {
  const router   = useRouter();
  const [value, setValue]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // ── Handlers ──

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();

    const username = value.trim();
    if (!username) {
      setError('Enter a Chess.com username to continue.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,25}$/.test(username)) {
      setError('That doesn\'t look like a valid Chess.com username.');
      return;
    }

    setError('');
    setLoading(true);
    router.push(`/${locale}/${username.toLowerCase()}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  // ── Render ──

  return (
    <div id="analyse" className="flex flex-col gap-0">

      {/* Label */}
      <label
        htmlFor="username-input"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9B9088] mb-2"
      >
        Your Chess.com Username
      </label>

      {/* Input row */}
      <div
        style={{ border: '1.5px solid #1A1A1A' }}
        className={`flex transition-all duration-150 ${error ? 'ring-2 ring-[#CC2222] ring-offset-0' : ''}`}
      >
        <input
          id="username-input"
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. GrandmasterK99"
          maxLength={25}
          autoComplete="off"
          spellCheck={false}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium
                     text-[#1A1A1A] placeholder:text-[#9B9088] placeholder:font-normal
                     px-4 py-3.5 min-w-0"
        />
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="bg-[#1A1A1A] text-[#F8F3E8] text-[11px] font-semibold tracking-[0.12em]
                     uppercase px-6 border-none cursor-pointer shrink-0
                     hover:bg-[#CC2222] disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors duration-150"
        >
          {loading ? 'Loading…' : 'Analyse →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[11px] text-[#CC2222] mt-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}