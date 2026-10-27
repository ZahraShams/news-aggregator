import type { Article, ArticleQuery, SourceId } from '../types/article';

/** What every source factory receives: where its API lives and the key to call it with. */
export interface SourceConfig {
  apiKey?: string;
  baseUrl: string;
}

export interface SourceResult {
  articles: Article[];
  hasMore: boolean;
}

/**
 * Contract every news provider implements. Adding a provider means writing a
 * new implementation and registering it; nothing else in the app changes.
 */
export interface NewsSource {
  readonly id: SourceId;
  readonly name: string;
  isConfigured(): boolean;
  fetchArticles(query: ArticleQuery, signal?: AbortSignal): Promise<SourceResult>;
}

export class SourceError extends Error {
  readonly source: SourceId;

  constructor(source: SourceId, message: string) {
    super(message);
    this.name = 'SourceError';
    this.source = source;
  }
}
