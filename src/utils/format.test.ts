import { describe, expect, it } from 'vitest';
import { stripHtml, timeAgo } from './format';

describe('timeAgo', () => {
  const now = new Date('2026-10-27T12:00:00Z');

  it.each([
    ['2026-10-27T11:59:50Z', 'just now'],
    ['2026-10-27T11:55:00Z', '5m ago'],
    ['2026-10-27T09:00:00Z', '3h ago'],
    ['2026-10-25T12:00:00Z', '2d ago'],
  ])('formats %s as "%s"', (iso, expected) => {
    expect(timeAgo(iso, now)).toBe(expected);
  });

  it('shows a date for anything older than a week', () => {
    expect(timeAgo('2026-09-01T12:00:00Z', now)).toMatch(/2026/);
  });

  it('returns an empty string for an invalid date', () => {
    expect(timeAgo('not a date', now)).toBe('');
  });
});

describe('stripHtml', () => {
  it('removes tags and decodes common entities', () => {
    expect(stripHtml('<p>Tom &amp; Jerry&#39;s <b>show</b></p>')).toBe("Tom & Jerry's show");
  });

  it('returns an empty string for missing text', () => {
    expect(stripHtml(null)).toBe('');
  });
});
