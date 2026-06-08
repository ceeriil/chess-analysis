// ============================================================
// ⬢ CHESS.COM API — ERRORS
// Typed error hierarchy. Always catch ChessApiError,
// then narrow by .code for specific handling.
// ============================================================

// ─── ERROR CODES ─────────────────────────────────────────────

export type ChessApiErrorCode =
  | 'NOT_FOUND'          // 404 — username doesn't exist
  | 'RATE_LIMITED'       // 429 — too many requests
  | 'FORBIDDEN'          // 403 — account closed/banned
  | 'NETWORK_ERROR'      // no connectivity
  | 'TIMEOUT'            // request took too long
  | 'PARSE_ERROR'        // response wasn't valid JSON / PGN
  | 'UNKNOWN';           // anything else


export class ChessApiError extends Error {
  public readonly code:       ChessApiErrorCode;
  public readonly statusCode: number | null;
  public readonly username:   string | null;

  constructor({
    message,
    code,
    statusCode = null,
    username   = null,
    cause,
  }: {
    message:     string;
    code:        ChessApiErrorCode;
    statusCode?: number | null;
    username?:   string | null;
    cause?:      unknown;
  }) {
    super(message);
    this.name       = 'ChessApiError';
    this.code       = code;
    this.statusCode = statusCode;
    this.username   = username;

    // Preserve cause chain for debugging
    if (cause instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  // ── Convenience factories ──

  static notFound(username: string): ChessApiError {
    return new ChessApiError({
      message:    `Player "${username}" not found on Chess.com.`,
      code:       'NOT_FOUND',
      statusCode: 404,
      username,
    });
  }

  static rateLimited(): ChessApiError {
    return new ChessApiError({
      message:    'Chess.com rate limit hit. Slow down.',
      code:       'RATE_LIMITED',
      statusCode: 429,
    });
  }

  static forbidden(username: string): ChessApiError {
    return new ChessApiError({
      message:    `Account "${username}" is closed or banned.`,
      code:       'FORBIDDEN',
      statusCode: 403,
      username,
    });
  }

  static networkError(cause?: unknown): ChessApiError {
    return new ChessApiError({
      message: 'Could not reach Chess.com. Check your connection.',
      code:    'NETWORK_ERROR',
      cause,
    });
  }

  static timeout(): ChessApiError {
    return new ChessApiError({
      message: 'Chess.com took too long to respond.',
      code:    'TIMEOUT',
    });
  }

  static parseError(context: string, cause?: unknown): ChessApiError {
    return new ChessApiError({
      message: `Failed to parse response: ${context}`,
      code:    'PARSE_ERROR',
      cause,
    });
  }

  static unknown(cause?: unknown): ChessApiError {
    return new ChessApiError({
      message: 'An unexpected error occurred.',
      code:    'UNKNOWN',
      cause,
    });
  }
}

// ─── TYPE GUARD ──────────────────────────────────────────────

export function isChessApiError(err: unknown): err is ChessApiError {
  return err instanceof ChessApiError;
}

// ─── USER-FACING MESSAGES ────────────────────────────────────
// Map error codes to copy shown in the UI.

export const ERROR_MESSAGES: Record<ChessApiErrorCode, string> = {
  NOT_FOUND:     "That username doesn't exist on Chess.com.",
  RATE_LIMITED:  'Too many requests. Wait a moment and try again.',
  FORBIDDEN:     'That account is closed or restricted.',
  NETWORK_ERROR: "Can't reach Chess.com right now. Check your connection.",
  TIMEOUT:       'Chess.com is taking too long. Try again.',
  PARSE_ERROR:   'Something went wrong parsing the data.',
  UNKNOWN:       'Something went wrong. Try again.',
};