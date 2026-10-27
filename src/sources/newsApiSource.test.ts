import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFetch } from '../test/mockFetch';
import { clearCache } from '../utils/http';
import { buildNewsApiUrl, createNewsApiSource, type NewsApiArticle } from './newsApiSource';

const BASE_URL = 'https://newsapi.org/v2';

const article: NewsApiArticle = {
  source: { id: 'bbc-news', name: 'BBC News' },
  author: null,
  title: 'Example headline',
  description: null,
  url: 'https://www.bbc.co.uk/news/example',
  urlToImage: null,
  publishedAt: '2026-10-27T08:00:00Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
  clearCache();
});

describe('buildNewsApiUrl', () => {
  it('uses top-headlines for a category without dates', () => {
    const url = new URL(buildNewsApiUrl({ category: 'business', page: 1 }, 'key', BASE_URL));

    expect(url.pathname).toBe('/v2/top-headlines');
    expect(url.searchParams.get('category')).toBe('business');
  });

  it('uses top-headlines when there are no filters at all', () => {
    const url = new URL(buildNewsApiUrl({ page: 1 }, 'key', BASE_URL));

    expect(url.pathname).toBe('/v2/top-headlines');
  });

  it('switches to everything when dates are set, folding the category into the keyword', () => {
    const url = new URL(buildNewsApiUrl({ keyword: 'ai', category: 'business', from: '2026-10-01', page: 2 }, 'key', BASE_URL));

    expect(url.pathname).toBe('/v2/everything');
    expect(url.searchParams.get('q')).toBe('ai AND business');
    expect(url.searchParams.get('from')).toBe('2026-10-01');
    expect(url.searchParams.has('category')).toBe(false);
  });

  it('uses everything for categories top-headlines does not support', () => {
    const url = new URL(buildNewsApiUrl({ category: 'politics', page: 1 }, 'key', BASE_URL));

    expect(url.pathname).toBe('/v2/everything');
    expect(url.searchParams.get('q')).toBe('politics');
  });
});

describe('createNewsApiSource', () => {
  it('keeps the original outlet name and drops removed articles', async () => {
    mockFetch({ totalResults: 2, articles: [article, { ...article, title: '[Removed]' }] });

    const { articles, hasMore } = await createNewsApiSource({ apiKey: 'key', baseUrl: BASE_URL }).fetchArticles({ page: 1 });

    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({ outlet: 'BBC News', source: 'newsapi', description: '' });
    expect(articles[0].author).toBeUndefined();
    expect(hasMore).toBe(false);
  });

  it('stops paginating at the free plan limit of 100 results', async () => {
    mockFetch({ totalResults: 5000, articles: [article] });

    expect((await createNewsApiSource({ apiKey: 'key', baseUrl: BASE_URL }).fetchArticles({ page: 5 })).hasMore).toBe(false);
  });
});
