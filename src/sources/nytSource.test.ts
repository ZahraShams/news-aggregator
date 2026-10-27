import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFetch } from '../test/mockFetch';
import { clearCache } from '../utils/http';
import { buildNytUrl, createNytSource, mapNytDoc, type NytDoc } from './nytSource';

const BASE_URL = 'https://api.nytimes.com/svc/search/v2';

const doc: NytDoc = {
  _id: 'nyt://article/123',
  web_url: 'https://www.nytimes.com/2026/10/27/business/example.html',
  headline: { main: 'Example headline' },
  abstract: 'Short summary.',
  pub_date: '2026-10-27T08:00:00+0000',
  section_name: 'Business',
  byline: { original: 'By Jane Doe' },
  multimedia: { default: { url: 'https://static01.nyt.com/example.jpg' } },
};

afterEach(() => {
  vi.unstubAllGlobals();
  clearCache();
});

describe('buildNytUrl', () => {
  it('converts dates to YYYYMMDD and pages to 0-based', () => {
    const url = new URL(buildNytUrl({ from: '2026-10-01', to: '2026-10-27', page: 1 }, 'key', BASE_URL));

    expect(url.searchParams.get('begin_date')).toBe('20261001');
    expect(url.searchParams.get('end_date')).toBe('20261027');
    expect(url.searchParams.get('page')).toBe('0');
  });

  it('filters by section when a category is chosen', () => {
    const url = new URL(buildNytUrl({ category: 'entertainment', page: 1 }, 'key', BASE_URL));

    expect(url.searchParams.get('fq')).toBe('section.name:"Arts"');
  });
});

describe('mapNytDoc', () => {
  it('converts an NYT doc into an Article', () => {
    expect(mapNytDoc(doc)).toEqual({
      id: 'nyt:nyt://article/123',
      title: 'Example headline',
      description: 'Short summary.',
      url: 'https://www.nytimes.com/2026/10/27/business/example.html',
      imageUrl: 'https://static01.nyt.com/example.jpg',
      author: 'By Jane Doe',
      publishedAt: '2026-10-27T08:00:00+0000',
      source: 'nyt',
      outlet: 'The New York Times',
      category: 'Business',
    });
  });

  it('supports the older array image format with relative URLs', () => {
    const article = mapNytDoc({
      ...doc,
      multimedia: [
        { url: 'images/small.jpg', subtype: 'thumbnail' },
        { url: 'images/large.jpg', subtype: 'xlarge' },
      ],
    });

    expect(article.imageUrl).toBe('https://www.nytimes.com/images/large.jpg');
  });

  it('falls back to the snippet and handles missing images and byline', () => {
    const article = mapNytDoc({ ...doc, abstract: '', snippet: 'Snippet.', multimedia: null, byline: undefined });

    expect(article.description).toBe('Snippet.');
    expect(article.imageUrl).toBeUndefined();
    expect(article.author).toBeUndefined();
  });
});

describe('createNytSource', () => {
  it('reports more pages based on the total hits', async () => {
    mockFetch({ response: { docs: [doc], metadata: { hits: 25 } } });
    const source = createNytSource({ apiKey: 'key', baseUrl: BASE_URL });

    expect((await source.fetchArticles({ page: 2 })).hasMore).toBe(true);
    clearCache();
    expect((await source.fetchArticles({ page: 3 })).hasMore).toBe(false);
  });

  it('treats a null docs list as no results', async () => {
    mockFetch({ response: { docs: null, meta: { hits: 0 } } });

    expect(await createNytSource({ apiKey: 'key', baseUrl: BASE_URL }).fetchArticles({ page: 1 })).toEqual({ articles: [], hasMore: false });
  });
});
