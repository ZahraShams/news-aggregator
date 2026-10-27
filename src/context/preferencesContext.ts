import { createContext } from 'react';
import { sources } from '../sources/registry';
import type { Category, SourceId } from '../types/article';

export interface Preferences {
  sources: SourceId[];
  categories: Category[];
  authors: string[];
}

export const DEFAULT_PREFERENCES: Preferences = {
  sources: sources.map((source) => source.id),
  categories: [],
  authors: [],
};

export interface PreferencesContextValue {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  isFollowing: (author: string) => boolean;
  toggleFollow: (author: string) => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
