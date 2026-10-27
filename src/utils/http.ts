import { SourceError } from '../sources/NewsSource';
import type { SourceId } from '../types/article';

type Params = Record<string, string | number | undefined>;

/** Builds a URL, skipping empty params so APIs don't receive `q=`. */
export function buildUrl(base: string, params: Params): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expires: number; data: unknown }>();

function errorMessage(status: number): string {
  if (status === 401 || status === 403) return 'API key was rejected.';
  if (status === 429) return 'Rate limit reached, try again in a minute.';
  return `Request failed (${status}).`;
}

/**
 * fetch + JSON with a short in-memory cache. Free API tiers are heavily rate
 * limited (NYT allows 5 requests a minute), so identical queries are reused.
 */
export async function getJson<T>(source: SourceId, url: string, signal?: AbortSignal): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.data as T;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    // A rejected key without CORS headers also lands here, the browser hides the 401.
    throw new SourceError(source, 'Could not reach the source (network error or invalid API key).');
  }

  if (!response.ok) throw new SourceError(source, errorMessage(response.status));

  const data = (await response.json()) as T;
  cache.set(url, { expires: Date.now() + CACHE_TTL_MS, data });
  return data;
}

export function clearCache(): void {
  cache.clear();
}
