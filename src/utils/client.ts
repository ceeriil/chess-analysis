// ============================================================
// ⬢ CHESS.COM API — HTTP CLIENT
// Axios instance with:
//   - Typed interceptors
//   - Retry on 429 with backoff
//   - Request queue for rate limiting
//   - Error normalisation into ChessApiError
// ============================================================

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { CHESS_API_BASE, CHESS_API_HEADERS, RATE_LIMIT } from '../constants';
import { ChessApiError } from './errors';

// ─── RATE LIMIT QUEUE ────────────────────────────────────────
// Simple token-bucket style queue. Ensures MIN_INTERVAL_MS
// between requests and caps MAX_CONCURRENT in-flight.

class RequestQueue {
  private queue:       Array<() => void> = [];
  private inFlight:    number            = 0;
  private lastRequest: number            = 0;

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        } finally {
          this.inFlight--;
          this.flush();
        }
      });
      this.flush();
    });
  }

  private flush() {
    if (
      this.queue.length === 0
      || this.inFlight >= RATE_LIMIT.MAX_CONCURRENT
    ) return;

    const now   = Date.now();
    const delay = Math.max(0, this.lastRequest + RATE_LIMIT.MIN_INTERVAL_MS - now);

    setTimeout(() => {
      const next = this.queue.shift();
      if (!next) return;
      this.inFlight++;
      this.lastRequest = Date.now();
      next();
    }, delay);
  }
}

// Singleton queue shared across all requests
const requestQueue = new RequestQueue();

// ─── AXIOS INSTANCE ──────────────────────────────────────────

const chessClient: AxiosInstance = axios.create({
  baseURL: CHESS_API_BASE,
  timeout: 15_000,
  headers: CHESS_API_HEADERS,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────

chessClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure no stale cached response from CDN
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────

chessClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  (error: unknown) => {
    // Let the retry wrapper handle 429 before we normalise
    // Everything else gets normalised here
    if (!isAxiosError(error)) {
      throw ChessApiError.unknown(error);
    }

    const status = error.response?.status;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw ChessApiError.timeout();
    }

    if (!error.response) {
      throw ChessApiError.networkError(error);
    }

    // Re-throw with status intact so retry wrapper can see 429
    throw error;
  },
);

// ─── RETRY WRAPPER ───────────────────────────────────────────

async function withRetry<T>(
  fn:       () => Promise<T>,
  retries:  number = RATE_LIMIT.MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isLast = attempt === retries;

      if (isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 429) {
          if (isLast) throw ChessApiError.rateLimited();
          // Exponential backoff: 2s, 4s, 8s
          await sleep(RATE_LIMIT.RETRY_DELAY_MS * 2 ** attempt);
          continue;
        }

        if (status === 404) throw ChessApiError.notFound(extractUsername(err.config?.url));
        if (status === 403) throw ChessApiError.forbidden(extractUsername(err.config?.url));

        if (err.code === 'ECONNABORTED') throw ChessApiError.timeout();
        if (!err.response)              throw ChessApiError.networkError(err);

        throw ChessApiError.unknown(err);
      }

      // Already a ChessApiError from the interceptor
      if (err instanceof ChessApiError) throw err;

      throw ChessApiError.unknown(err);
    }
  }

  // TypeScript needs this but the loop above always returns or throws
  throw ChessApiError.unknown();
}

// ─── PUBLIC API ──────────────────────────────────────────────

export async function chessGet<T>(
  path:    string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return requestQueue.enqueue(() =>
    withRetry(() =>
      chessClient
        .get<T>(path, config)
        .then((res) => res.data),
    ),
  );
}

// ─── HELPERS ─────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractUsername(url?: string): string {
  if (!url) return 'unknown';
  const match = url.match(/\/player\/([^/]+)/);
  return match?.[1] ?? 'unknown';
}