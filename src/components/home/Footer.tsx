// ============================================================
// ⬢ FOOTER
// ============================================================

export function Footer() {
  return (
    <footer
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between
                 px-7 py-[18px] bg-[#F8F3E8] gap-2"
    >
      <p
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[10px] tracking-[0.1em] uppercase text-[#9B9088]"
      >
        Postmortem · Chess Analysis · V1
      </p>
      <p
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[10px] text-[#9B9088]"
      >
        Data via Chess.com public API · Not affiliated with Chess.com
      </p>
    </footer>
  );
}