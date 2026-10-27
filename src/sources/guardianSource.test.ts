import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearCache } from '../utils/http';
import {
  buildGuardianUrl,
  createGuardianSource,
  mapGuardianResult,
  type GuardianResult,
} from './guardianSource';
import { SourceError } from './NewsSource';

const result: GuardianResult = {
  id: 'world/2026/oct/27/example',
  sectionName: 'World news',
  webTitle: 'Example headline',
  webUrl: 'https://www.theguardian.com/world/2026/oct/27/example',
  webPublicationDate: '2026-10-27T08:00:00Z',
  fields: {
    trailText: '<strong>Big</strong> news &amp; more',
    byline: 'Jane Doe',
    thumbnail: 'https://media.guim.co.uk/example.jpg',
  },
};

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearCache();
});

describe('buildGuardianUrl', () => {
  it('maps the category to a Guardian section and passes the dates through', () => {
    const url = new URL(
      buildGuardianUrl({ category: 'sports', from: '2026-10-01', to: '2026-10-27', page: 2 }, 'key'),
    );

    expect(url.searchParams.get('section')).toBe('sport');
    expect(url.searchParams.get('from-date')).toBe('2026-10-01');
    expect(url.searchParams.get('to-date')).toBe('2026-10-27');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('leaves out filters the user did not set', () => {
    const url = new URL(buildGuardianUrl({ page: 1 }, 'key'));

    expect(url.searchParams.has('q')).toBe(false);
    expect(url.searchParams.has('section')).toBe(false);
  });
});

describe('mapGuardianResult', () => {
  it('converts a Guardian result into an Article', () => {
    expect(mapGuardianResult(result)).toEqual({
      id: 'guardian:world/2026/oct/27/example',
      title: 'Example headline',
      description: 'Big news & more',
      url: 'https://www.theguardian.com/world/2026/oct/27/example',
      imageUrl: 'https://media.guim.co.uk/example.jpg',
      author: 'Jane Doe',
      publishedAt: '2026-10-27T08:00:00Z',
      source: 'guardian',
      outlet: 'The Guardian',
      category: 'World news',
    });
  });

  it('copes with a result that has no extra fields', () => {
    const article = mapGuardianResult({ ...result, fields: undefined });

    expect(article.description).toBe('');
    expect(article.imageUrl).toBeUndefined();
    expect(article.author).toBeUndefined();
  });
});

describe('createGuardianSource', () => {
  it('is only configured when an API key is given', () => {
    expect(createGuardianSource('key').isConfigured()).toBe(true);
    expect(createGuardianSource(undefined).isConfigured()).toBe(false);
  });

  it('returns articles and reports whether more pages exist', async () => {
    mockFetch({ response: { currentPage: 1, pages: 3, results: [result] } });

    const { articles, hasMore } = await createGuardianSource('key').fetchArticles({ page: 1 });

    expect(articles).toHaveLength(1);
    expect(hasMore).toBe(true);
  });

  it('throws a SourceError when the key is rejected', async () => {
    mockFetch({ message: 'Unauthorized' }, 401);

    await expect(createGuardianSource('bad').fetchArticles({ page: 1 })).rejects.toEqual(
      new SourceError('guardian', 'API key was rejected.'),
    );
  });
});
