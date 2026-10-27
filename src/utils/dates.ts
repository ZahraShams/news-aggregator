export type DatePreset = 'any' | 'today' | 'week' | 'month' | 'custom';

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Past week' },
  { id: 'month', label: 'Past month' },
  { id: 'custom', label: 'Custom' },
];

const DAYS_BACK: Partial<Record<DatePreset, number>> = { today: 0, week: 7, month: 30 };

/** Local date as YYYY-MM-DD. toISOString() would use UTC and can be off by a day. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The from/to range for a preset. "any" and "custom" have no fixed range. */
export function presetRange(preset: DatePreset, now: Date = new Date()): { from?: string; to?: string } {
  const daysBack = DAYS_BACK[preset];
  if (daysBack === undefined) return {};

  const from = new Date(now);
  from.setDate(from.getDate() - daysBack);
  return { from: toIsoDate(from), to: toIsoDate(now) };
}
