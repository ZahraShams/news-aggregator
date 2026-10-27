import { describe, expect, it } from 'vitest';
import { presetRange, toIsoDate } from './dates';

describe('toIsoDate', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('presetRange', () => {
  const now = new Date(2026, 9, 27);

  it.each([
    ['today', '2026-10-27'],
    ['week', '2026-10-20'],
    ['month', '2026-09-27'],
  ] as const)('starts "%s" on %s and ends today', (preset, from) => {
    expect(presetRange(preset, now)).toEqual({ from, to: '2026-10-27' });
  });

  it('has no range for "any" and "custom"', () => {
    expect(presetRange('any', now)).toEqual({});
    expect(presetRange('custom', now)).toEqual({});
  });
});
