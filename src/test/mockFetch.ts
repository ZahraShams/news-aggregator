import { vi } from 'vitest';

/** Replaces the global fetch with one that answers every request with `body`. */
export function mockFetch(body: unknown, status = 200) {
  // A new Response per call, because a response body can only be read once.
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
