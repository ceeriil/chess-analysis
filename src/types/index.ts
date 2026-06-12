// ============================================================
// ⬢ CHESS.COM API — TYPES
// Raw API shapes + internal derived types.
// Never mutate the Raw* types — derive from them.
// ============================================================

// ─── CONSTANTS ───────────────────────────────────────────────

export type TimeControl = 'rapid' | 'blitz' | 'bullet' | 'daily' | 'unknown';

export type GameResult =
  | 'win'
  | 'loss'
  | 'draw'
  | 'stalemate'
  | 'insufficient'
  | 'repetition'
  | 'timeout'
  | 'resigned'
  | 'checkmated'
  | 'timevsinsufficient'
  | 'abandoned'
  | 'unknown';

export type GameColor = 'white' | 'black';

export type BadgeVariant = 'nemesis' | 'rival' | 'punching-bag' | 'active' | 'dormant';

// ─── RAW CHESS.COM API SHAPES ─────────────────────────────────
// Exactly what the API returns — don't change these.

export type RawPlayer = {
  player_id:    number;
  '@id':        string;
  url:          string;
  username:     string;
  followers:    number;
  country?:     string;    // URL like "https://api.chess.com/pub/country/NG" — absent for some accounts
  last_online:  number;    // Unix timestamp
  joined:       number;    // Unix timestamp
  status:       string;    // 'premium' | 'basic' | 'mod' | 'staff' | 'closed'
  is_streamer:  boolean;
  verified:     boolean;
  league?:      string;
  avatar?:      string;
  name?:        string;
  title?:       string;    // 'GM' | 'IM' | 'FM' | 'CM' | 'NM' | 'WGM' etc
  location?:    string;
};

export type RawPlayerStats = {
  chess_rapid?: RawRatingCategory;
  chess_blitz?: RawRatingCategory;
  chess_bullet?: RawRatingCategory;
  chess_daily?: RawRatingCategory;
  chess960_daily?: RawRatingCategory;
  tactics?: {
    highest: { rating: number; date: number };
    lowest:  { rating: number; date: number };
  };
  lessons?: {
    highest: { rating: number; date: number };
    lowest:  { rating: number; date: number };
  };
};

export type RawRatingCategory = {
  last:  { rating: number; date: number; rd: number };
  best:  { rating: number; date: number; game: string };
  record: {
    win:  number;
    loss: number;
    draw: number;
    time_per_move?: number;
    timeout_percent?: number;
  };
};

export type RawGame = {
  url:           string;
  pgn:           string;
  time_control:  string;   // e.g. "600", "180+2", "1/86400"
  end_time:      number;   // Unix timestamp
  rated:         boolean;
  tcn:           string;
  uuid:          string;
  initial_setup: string;
  fen:           string;
  time_class:    string;   // 'rapid' | 'blitz' | 'bullet' | 'daily'
  rules:         string;   // 'chess' | 'chess960' etc
  white: RawGamePlayer;
  black: RawGamePlayer;
  tournament?: string;
  match?: string;
};

export type RawGamePlayer = {
  rating:   number;
  result:   string;   // 'win' | 'checkmated' | 'timeout' | 'resigned' | 'stalemate' | etc
  '@id':    string;
  username: string;
  uuid:     string;
};

export type RawMonthlyGames = {
  games: RawGame[];
};

export type RawArchives = {
  archives: string[];   // array of URLs like "https://api.chess.com/.../2024/01"
};

export type RawOnlineStatus = {
  online: boolean;
};

export type RawCountry = {
  code: string;
  name: string;
};

// ─── PARSED / DERIVED TYPES ───────────────────────────────────
// These are what the app works with after transformation.

export type Player = {
  username:   string;
  displayName: string;
  avatar:     string | null;
  countryCode: string;       // "NG", "US", etc — extracted from URL
  joined:     Date;
  lastOnline: Date;
  isOnline:   boolean;
  status:     string;
  title:      string | null;
  profileUrl: string;
  followers:  number;
};

export type PlayerRating = {
  current:   number;
  best:      number;
  bestDate:  Date;
  wins:      number;
  losses:    number;
  draws:     number;
  winRate:   number;         // 0–100
};

export type PlayerStats = {
  rapid:   PlayerRating | null;
  blitz:   PlayerRating | null;
  bullet:  PlayerRating | null;
  daily:   PlayerRating | null;
};

export type ParsedGame = {
  uuid:          string;
  url:           string;
  playedAt:      Date;
  timeControl:   TimeControl;
  timeControlRaw: string;
  rated:         boolean;
  color:         GameColor;          // color the tracked user played
  result:        GameResult;         // from tracked user's perspective
  myRating:      number;
  opponentRating: number;
  opponentUsername: string;
  opening:       string | null;      // from PGN [Opening] header
  eco:           string | null;      // from PGN [ECO] header
  termination:   string | null;      // from PGN [Termination] header — "resigned", "time", etc
  pgn:           string;
};

// ─── DERIVED / COMPUTED TYPES ─────────────────────────────────
// Built from collections of ParsedGame.

export type OpponentSummary = {
  username:       string;
  // H2H record from my perspective
  wins:           number;
  losses:         number;
  draws:          number;
  totalGames:     number;
  winRate:        number;            // 0–100
  // ELO context
  myEloAtFirst:   number;            // my ELO in the first game we played
  theirEloAtFirst: number;
  myEloAtLast:    number;            // my ELO in the most recent game
  theirEloAtLast: number;
  theirEloDelta:  number;            // theirEloAtLast - theirEloAtFirst
  // Timing
  firstPlayedAt:  Date;
  lastPlayedAt:   Date;
  daysSinceLastGame: number;
  // Classification
  badge:          BadgeVariant;
  // Streaks
  currentStreak:  { type: 'win' | 'loss' | 'draw'; count: number };
  longestWinStreak:  number;
  longestLossStreak: number;
  // Games
  games:          ParsedGame[];
  // Openings they played against me
  openingsAgainstMe: OpeningFrequency[];
  // Time controls we've played
  timeControls:   TimeControl[];
};

export type OpeningFrequency = {
  eco:      string;
  name:     string;
  count:    number;
  myWins:   number;
  myLosses: number;
  myDraws:  number;
  winRate:  number;
};

export type NemesisClassification = {
  isNemesis:     boolean;
  isRival:       boolean;
  isPunchingBag: boolean;  // you beat them disproportionately
  reason:        string;
};

// ─── API FETCH PARAMS ─────────────────────────────────────────

export type FetchGamesParams = {
  username:    string;
  fromDate?:   Date;
  toDate?:     Date;
  timeControl?: TimeControl;
};

export type MonthYear = {
  year:  number;
  month: number;  // 1–12
};