// ============================================================
// ⬢ SAMPLE OPPONENTS SECTION
// Shows what the analysis output looks like using mock data
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────

type BadgeVariant = 'active' | 'nemesis' | 'rival' | 'dormant';

type DeltaVariant = 'up' | 'down' | 'flat';

type OpponentCard = {
  name:       string;
  since:      string;
  games:      number;
  badge:      BadgeVariant;
  wins:       number;
  draws:      number;
  losses:     number;
  elo:        string;
  deltaLabel: string;
  deltaDir:   DeltaVariant;
};

type TableRow = {
  rank:    number;
  name:    string;
  badge:   BadgeVariant;
  elo:     string;
  delta:   string;
  deltaDir: DeltaVariant;
  wdl:     string;
  winPct:  string;
  games:   number;
};

// ─── DATA ────────────────────────────────────────────────────

const CARDS: OpponentCard[] = [
  {
    name:       'GrandmasterK99',
    since:      'Member since 2019',
    games:      12,
    badge:      'active',
    wins:       3,
    draws:      1,
    losses:     8,
    elo:        '1,604',
    deltaLabel: '+212 this year',
    deltaDir:   'up',
  },
  {
    name:       'SilentDestroyer',
    since:      'Member since 2021',
    games:      7,
    badge:      'nemesis',
    wins:       0,
    draws:      0,
    losses:     7,
    elo:        '1,892',
    deltaLabel: 'L7 streak active',
    deltaDir:   'down',
  },
  {
    name:       'PawnStructure_X',
    since:      'Member since 2020',
    games:      14,
    badge:      'rival',
    wins:       6,
    draws:      2,
    losses:     6,
    elo:        '1,210',
    deltaLabel: '+800 tracked',
    deltaDir:   'up',
  },
];

const TABLE_ROWS: TableRow[] = [
  { rank: 1, name: 'GrandmasterK99',  badge: 'active',  elo: '1,604', delta: '+212', deltaDir: 'up',   wdl: '3 / 1 / 8',  winPct: '27%', games: 12 },
  { rank: 2, name: 'SilentDestroyer', badge: 'nemesis', elo: '1,892', delta: '+44',  deltaDir: 'up',   wdl: '0 / 0 / 7',  winPct: '0%',  games: 7  },
  { rank: 3, name: 'PawnStructure_X', badge: 'rival',   elo: '1,210', delta: '-18',  deltaDir: 'down', wdl: '6 / 2 / 6',  winPct: '43%', games: 14 },
  { rank: 4, name: 'KaspyFan2003',    badge: 'dormant', elo: '740',   delta: '-219', deltaDir: 'down', wdl: '11 / 1 / 1', winPct: '85%', games: 13 },
];

// ─── HELPERS ─────────────────────────────────────────────────

const BADGE_STYLES: Record<BadgeVariant, string> = {
  active:  'text-[#0099AA] border-[#0099AA]',
  nemesis: 'text-[#CC2222] border-[#CC2222] bg-[#FFF0F0]',
  rival:   'text-[#F0B429] border-[#F0B429]',
  dormant: 'text-[#9B9088] border-[#9B9088]',
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  active:  '● Active',
  nemesis: 'Nemesis',
  rival:   'Rival',
  dormant: '○ Dormant',
};

const DELTA_STYLES: Record<DeltaVariant, string> = {
  up:   'text-[#22AA44] border-[#22AA44]',
  down: 'text-[#CC2222] border-[#CC2222]',
  flat: 'text-[#9B9088] border-[#9B9088]',
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid currentColor' }}
      className={`inline-flex items-center text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 ${BADGE_STYLES[variant]}`}
    >
      {BADGE_LABELS[variant]}
    </span>
  );
}

function DeltaPill({ label, dir }: { label: string; dir: DeltaVariant }) {
  return (
    <span
      style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1.5px solid currentColor' }}
      className={`text-[10px] font-semibold px-2 py-0.5 ${DELTA_STYLES[dir]}`}
    >
      {label}
    </span>
  );
}

function OpponentCardTile({ card }: { card: OpponentCard }) {
  return (
    <div className="p-[22px] flex flex-col gap-3.5">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold tracking-[0.04em] text-[#1A1A1A]"
          >
            {card.name}
          </p>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] text-[#9B9088] mt-0.5"
          >
            {card.since} · {card.games} games
          </p>
        </div>
        <Badge variant={card.badge} />
      </div>

      {/* W/D/L grid */}
      <div style={{ border: '1.5px solid #C5C8B5' }} className="grid grid-cols-3">
        {[
          { val: card.wins,   lbl: 'Won',  color: '#22AA44' },
          { val: card.draws,  lbl: 'Draw', color: '#1A1A1A' },
          { val: card.losses, lbl: 'Lost', color: '#CC2222' },
        ].map((s, i) => (
          <div
            key={s.lbl}
            style={{ borderRight: i < 2 ? '1.5px solid #C5C8B5' : 'none' }}
            className="text-center py-2"
          >
            <p
              style={{ fontFamily: "'Playfair Display', serif", color: s.color, lineHeight: '1' }}
              className="text-[20px] font-bold"
            >
              {s.val}
            </p>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[9px] uppercase tracking-[0.1em] text-[#9B9088] mt-0.5"
            >
              {s.lbl}
            </p>
          </div>
        ))}
      </div>

      {/* ELO row */}
      <div className="flex items-end justify-between">
        <div>
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10px] uppercase tracking-[0.1em] text-[#9B9088]"
          >
            Their Rapid ELO
          </p>
          <p
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: '1' }}
            className="text-[26px] font-bold text-[#1A1A1A] mt-0.5"
          >
            {card.elo}
          </p>
        </div>
        <DeltaPill label={card.deltaLabel} dir={card.deltaDir} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export function SampleOpponentsSection() {
  return (
    <section className="bg-[#F8F3E8]">

      {/* Section header */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="flex items-center justify-between px-7 py-[18px]"
      >
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] tracking-[0.16em] uppercase text-[#9B9088]"
        >
          <span className="text-[#1A1A1A] font-semibold">Sample Analysis</span>
          {' — '}Top Opponents by Games Played
        </p>
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] tracking-[0.12em] uppercase text-[#9B9088] hidden sm:block"
        >
          Rapid · All Time
        </p>
      </div>

      {/* Cards */}
      <div
        style={{ borderBottom: '1.5px solid #1A1A1A' }}
        className="grid grid-cols-1 sm:grid-cols-3"
      >
        {CARDS.map((card, i) => {
          const isLast = i === CARDS.length - 1;
          return (
            <div
              key={card.name}
              style={{ borderRight: isLast ? 'none' : '1.5px solid #1A1A1A' }}
            >
              <OpponentCardTile card={card} />
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ borderBottom: '1.5px solid #1A1A1A' }}>
        <div
          style={{ borderBottom: '1.5px solid #C5C8B5' }}
          className="px-7 py-3"
        >
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9B9088]"
          >
            Most Encountered — Sorted by ELO Delta / Win Rate / Games
          </p>
        </div>

        {/* Table header */}
        <div
          style={{
            fontFamily:    "'IBM Plex Mono', monospace",
            borderBottom:  '1.5px solid #C5C8B5',
          }}
          className="hidden md:grid grid-cols-[40px_1fr_100px_80px_80px_100px_60px_60px]
                     px-7 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9B9088]"
        >
          <span>#</span>
          <span>Opponent</span>
          <span>Status</span>
          <span>ELO</span>
          <span>Δ Week</span>
          <span>W / D / L</span>
          <span>Win %</span>
          <span>Games</span>
        </div>

        {/* Rows */}
        {TABLE_ROWS.map((row, i) => {
          const isLast = i === TABLE_ROWS.length - 1;
          return (
            <div
              key={row.name}
              style={{
                fontFamily:   "'IBM Plex Mono', monospace",
                borderBottom: isLast ? 'none' : '1.5px solid #C5C8B5',
              }}
              className="grid grid-cols-[40px_1fr] md:grid-cols-[40px_1fr_100px_80px_80px_100px_60px_60px]
                         px-7 py-3 items-center text-[12px]
                         hover:bg-[#F0E8D8] transition-colors duration-100"
            >
              <span className="text-[#9B9088] text-[11px]">{row.rank}</span>
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[#1A1A1A]">{row.name}</span>
                <span className="md:hidden">
                  <Badge variant={row.badge} />
                </span>
              </div>
              <span className="hidden md:block">
                <Badge variant={row.badge} />
              </span>
              <span
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="hidden md:block text-[14px] font-bold text-[#1A1A1A]"
              >
                {row.elo}
              </span>
              <span className="hidden md:block">
                <DeltaPill label={row.delta} dir={row.deltaDir} />
              </span>
              <span className="hidden md:block text-[11px] text-[#9B9088]">{row.wdl}</span>
              <span
                className={`hidden md:block text-[12px] font-medium
                  ${parseInt(row.winPct) > 50 ? 'text-[#22AA44]' : parseInt(row.winPct) === 0 ? 'text-[#CC2222]' : 'text-[#1A1A1A]'}`}
              >
                {row.winPct}
              </span>
              <span className="hidden md:block text-[11px] text-[#9B9088]">{row.games}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}