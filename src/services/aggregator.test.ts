import { describe, expect, it, vi } from 'vitest';
import { SourceError, type NewsSource, type SourceResult } from '../sources/NewsSource';
import type { Article, SourceId } from '../types/article';
import { appendArticles, createTasks, fetchPage, mergeArticles } from './aggregator';

function article(id: string, publishedAt: string, overrides: Partial<Article> = {}): Article {
  return {
    id,
    title: `Title ${id}`,
    description: '',
    url: `https://example.com/${id}`,
    publishedAt,
    source: 'guardian',
    outlet: 'The Guardian',
    ...overrides,
  };
}

function fakeSource(id: SourceId, fetchArticles: () => Promise<SourceResult>): NewsSource {
  return { id, name: id, isConfigured: () => true, fetchArticles: vi.fn(fetchArticles) };
}

describe('createTasks', () => {
  it('creates one task per source and query', () => {
    const empty = async () => ({ articles: [], hasMore: false });
    const sources = [fakeSource('guardian', empty), fakeSource('nyt', empty)];

    const tasks = createTasks(sources, [{ category: 'business' }, {}]);

    expect(tasks.map((task) => task.key)).toEqual([
      'guardian|business',
      'guardian|all',
      'nyt|business',
      'nyt|all',
    ]);
  });
});

describe('mergeArticles', () => {
  it('sorts newest first', () => {
    const merged = mergeArticles(
      [article('old', '2026-10-01T00:00:00Z')],
      [article('new', '2026-10-27T00:00:00Z')],
    );

    expect(merged.map((a) => a.id)).toEqual(['new', 'old']);
  });

  it('drops duplicates by URL and by title, keeping the first one seen', () => {
    const original = article('a', '2026-10-27T00:00:00Z');
    const sameUrl = { ...original, id: 'b', title: 'Different title' };
    const sameTitle = article('c', '2026-10-26T00:00:00Z', { title: '  TITLE A ' });

    expect(mergeArticles([original], [sameUrl, sameTitle]).map((a) => a.id)).toEqual(['a']);
  });
});

describe('appendArticles', () => {
  it('keeps the current order and adds only new articles below', () => {
    const onScreen = [article('a', '2026-10-01T00:00:00Z')];
    const nextPage = [article('a', '2026-10-01T00:00:00Z'), article('b', '2026-10-27T00:00:00Z')];

    expect(appendArticles(onScreen, nextPage).map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('fetchPage', () => {
  it('passes the page number to every source', async () => {
    const source = fakeSource('guardian', async () => ({ articles: [], hasMore: false }));

    await fetchPage(createTasks([source], [{ keyword: 'ai' }]), 3);

    expect(source.fetchArticles).toHaveBeenCalledWith({ keyword: 'ai', page: 3 }, undefined);
  });

  it('returns articles from healthy sources and reports the failing one', async () => {
    const healthy = fakeSource('guardian', async () => ({
      articles: [article('a', '2026-10-27T00:00:00Z')],
      hasMore: true,
    }));
    const broken = fakeSource('nyt', async () => {
      throw new SourceError('nyt', 'Rate limit reached, try again in a minute.');
    });

    const result = await fetchPage(createTasks([healthy, broken], [{}]), 1);

    expect(result.articles).toHaveLength(1);
    expect(result.moreKeys).toEqual(['guardian|all']);
    expect(result.errors).toEqual({ nyt: 'Rate limit reached, try again in a minute.' });
  });

  it('shows a generic message for unexpected errors', async () => {
    const broken = fakeSource('newsapi', async () => {
      throw new TypeError('boom');
    });

    const result = await fetchPage(createTasks([broken], [{}]), 1);

    expect(result.errors).toEqual({ newsapi: 'Something went wrong.' });
  });

  it('does not report cancelled requests as errors', async () => {
    const cancelled = fakeSource('guardian', async () => {
      throw new DOMException('Aborted', 'AbortError');
    });

    const result = await fetchPage(createTasks([cancelled], [{}]), 1);

    expect(result.errors).toEqual({});
  });
});
