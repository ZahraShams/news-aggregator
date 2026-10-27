import type { Article, ArticleQuery, Category } from '../types/article';
import { stripHtml } from '../utils/format';
import { buildUrl, getJson } from '../utils/http';
import type { NewsSource, SourceConfig, SourceResult } from './NewsSource';

const PAGE_SIZE = 20;

/** Our categories mapped to Guardian section ids. */
const SECTIONS: Record<Category, string> = {
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'society',
  sports: 'sport',
  entertainment: 'culture',
  politics: 'politics',
};

export interface GuardianResult {
  id: string;
  sectionName: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: {
    thumbnail?: string;
    trailText?: string;
    byline?: string;
  };
}

interface GuardianResponse {
  response: {
    currentPage: number;
    pages: number;
    results: GuardianResult[];
  };
}

export function buildGuardianUrl(query: ArticleQuery, apiKey: string, baseUrl: string): string {
  return buildUrl(baseUrl, 'search', {
    q: query.keyword,
    section: query.category && SECTIONS[query.category],
    'from-date': query.from,
    'to-date': query.to,
    page: query.page,
    'page-size': PAGE_SIZE,
    'order-by': 'newest',
    'show-fields': 'thumbnail,trailText,byline',
    'api-key': apiKey,
  });
}

export function mapGuardianResult(result: GuardianResult): Article {
  return {
    id: `guardian:${result.id}`,
    title: result.webTitle,
    description: stripHtml(result.fields?.trailText),
    url: result.webUrl,
    imageUrl: result.fields?.thumbnail,
    author: result.fields?.byline,
    publishedAt: result.webPublicationDate,
    source: 'guardian',
    outlet: 'The Guardian',
    category: result.sectionName,
  };
}

export function createGuardianSource({ apiKey, baseUrl }: SourceConfig): NewsSource {
  return {
    id: 'guardian',
    name: 'The Guardian',
    isConfigured: () => Boolean(apiKey),

    async fetchArticles(query, signal): Promise<SourceResult> {
      if (!apiKey) return { articles: [], hasMore: false };

      const url = buildGuardianUrl(query, apiKey, baseUrl);
      const { response } = await getJson<GuardianResponse>('guardian', url, signal);
      return {
        articles: response.results.map(mapGuardianResult),
        hasMore: response.currentPage < response.pages,
      };
    },
  };
}
