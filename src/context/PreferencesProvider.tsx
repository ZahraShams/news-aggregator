import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cleanAuthor, normalizeAuthor } from '../utils/format';
import { storage } from '../utils/storage';
import { DEFAULT_PREFERENCES, PreferencesContext, type Preferences } from './preferencesContext';

const STORAGE_KEY = 'news-aggregator:preferences';

/** Holds the reader's feed preferences and saves them to localStorage. */
export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => storage.get(STORAGE_KEY, DEFAULT_PREFERENCES));

  useEffect(() => storage.set(STORAGE_KEY, preferences), [preferences]);

  const isFollowing = useCallback(
    (author: string) => preferences.authors.some((name) => normalizeAuthor(name) === normalizeAuthor(author)),
    [preferences.authors],
  );

  const toggleFollow = useCallback((author: string) => {
    setPreferences((prev) => {
      const others = prev.authors.filter((name) => normalizeAuthor(name) !== normalizeAuthor(author));
      const wasFollowing = others.length !== prev.authors.length;
      return { ...prev, authors: wasFollowing ? others : [...prev.authors, cleanAuthor(author)] };
    });
  }, []);

  const value = useMemo(
    () => ({ preferences, setPreferences, isFollowing, toggleFollow }),
    [preferences, isFollowing, toggleFollow],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
