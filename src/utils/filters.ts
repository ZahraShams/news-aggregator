import { sources } from '../sources/registry';
import type { Category, SourceId } from '../types/article';
import type { DatePreset } from './dates';

export interface Filters {
  category?: Category;
  datePreset: DatePreset;
  from?: string;
  to?: string;
  sources: SourceId[];
}

export const DEFAULT_FILTERS: Filters = {
  datePreset: 'any',
  sources: sources.map((source) => source.id),
};

/** How many filter groups differ from the defaults, shown as a badge on the Filters button. */
export function countActiveFilters(filters: Filters): number {
  return [
    filters.category !== undefined,
    filters.datePreset !== 'any',
    filters.sources.length !== DEFAULT_FILTERS.sources.length,
  ].filter(Boolean).length;
}
