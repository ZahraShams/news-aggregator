import { SourceError, type NewsSource } from '../sources/NewsSource';
import type { Article, ArticleQuery, SourceId } from '../types/article';

export type TaskQuery = Omit<ArticleQuery, 'page'>;

/** One stream of results: a source paired with the query to run against it. */
export interface FetchTask {
  key: string;
  source: NewsSource;
  query: TaskQuery;
}

export interface AggregatedPage {
  articles: Article[];
  /** Keys of the tasks that have another page to load. */
  moreKeys: string[];
  errors: Partial<Record<SourceId, string>>;
}

/** One task per source and query, e.g. 3 sources x 2 categories = 6 tasks. */
export function createTasks(sources: NewsSource[], queries: TaskQuery[]): FetchTask[] {
  return sources.flatMap((source) =>
    queries.map((query) => ({
      key: `${source.id}|${query.category ?? 'all'}`,
      source,
      query,
    })),
  );
}

const titleKey = (article: Article) => article.title.trim().toLowerCase();

/**
 * Merges lists into one timeline, newest first. The same story can come back
 * from several sources or categories, so duplicates are dropped by URL and by title.
 */
export function mergeArticles(...lists: Article[][]): Article[] {
  const seen = new Set<string>();
  const merged: Article[] = [];

  for (const article of lists.flat()) {
    if (seen.has(article.url) || seen.has(titleKey(article))) continue;
    seen.add(article.url);
    seen.add(titleKey(article));
    merged.push(article);
  }

  return merged.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/** Adds the next page below what is already on screen, so nothing the user is reading moves. */
export function appendArticles(existing: Article[], incoming: Article[]): Article[] {
  const seen = new Set(existing.flatMap((article) => [article.url, titleKey(article)]));
  const fresh = mergeArticles(incoming).filter(
    (article) => !seen.has(article.url) && !seen.has(titleKey(article)),
  );
  return [...existing, ...fresh];
}

const isAbort = (reason: unknown) => reason instanceof DOMException && reason.name === 'AbortError';

/**
 * Runs every task in parallel. A failing source never breaks the page: its
 * error is reported on its own and the other sources' articles are still returned.
 */
export async function fetchPage(tasks: FetchTask[], page: number, signal?: AbortSignal): Promise<AggregatedPage> {
  const results = await Promise.allSettled(
    tasks.map((task) => task.source.fetchArticles({ ...task.query, page }, signal)),
  );

  const lists: Article[][] = [];
  const moreKeys: string[] = [];
  const errors: AggregatedPage['errors'] = {};

  results.forEach((result, i) => {
    const task = tasks[i];

    if (result.status === 'fulfilled') {
      lists.push(result.value.articles);
      if (result.value.hasMore) moreKeys.push(task.key);
    } else if (!isAbort(result.reason)) {
      errors[task.source.id] =
        result.reason instanceof SourceError ? result.reason.message : 'Something went wrong.';
    }
  });

  return { articles: mergeArticles(...lists), moreKeys, errors };
}
