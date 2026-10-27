/**
 * localStorage that never throws. Storage can be blocked (private mode,
 * browser settings) or hold invalid JSON; the app should still work then.
 */
export const storage = {
  get<T extends object>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      // Merging with the fallback fills in fields added after the value was saved.
      return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Not being able to save preferences shouldn't break the page.
    }
  },
};
