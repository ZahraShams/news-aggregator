import { describe, expect, it } from 'vitest';
import type { Article } from '../types/article';
import { isByFollowedAuthor, prioritizeFollowed } from './personalize';

function article(id: string, author?: string): Article {
  return {
    id,
    title: id,
    description: '',
    url: `https://example.com/${id}`,
    publishedAt: '2026-10-27T00:00:00Z',
    source: 'nyt',
    outlet: 'The New York Times',
    author,
  };
}

describe('isByFollowedAuthor', () => {
  it('ignores case and the "By" prefix', () => {
    expect(isByFollowedAuthor(article('a', 'By JANE DOE'), ['jane doe'])).toBe(true);
  });

  it('matches one author in a byline with several', () => {
    expect(isByFollowedAuthor(article('a', 'By John Roe and Jane Doe'), ['Jane Doe'])).toBe(true);
  });

  it('is false for other authors, missing authors and an empty follow list', () => {
    expect(isByFollowedAuthor(article('a', 'Someone Else'), ['Jane Doe'])).toBe(false);
    expect(isByFollowedAuthor(article('a'), ['Jane Doe'])).toBe(false);
    expect(isByFollowedAuthor(article('a', 'Jane Doe'), [])).toBe(false);
  });
});

describe('prioritizeFollowed', () => {
  it('moves followed authors first and keeps the rest in order', () => {
    const list = [article('1', 'X'), article('2', 'Jane Doe'), article('3', 'Y'), article('4', 'Jane Doe')];

    expect(prioritizeFollowed(list, ['Jane Doe']).map((a) => a.id)).toEqual(['2', '4', '1', '3']);
  });

  it('returns the same list when nobody is followed', () => {
    const list = [article('1', 'X')];

    expect(prioritizeFollowed(list, [])).toBe(list);
  });
});
