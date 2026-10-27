import type { Article, ArticleQuery, Category } from '../types/article';
import { buildUrl, getJson } from '../utils/http';
import type { NewsSource, SourceConfig, SourceResult } from './NewsSource';

const PAGE_SIZE = 20;
/** The free plan only returns the first 100 results of any query. */
const MAX_RESULTS = 100;

/** Categories the top-headlines endpoint understands ("politics" is not one of them). */
const HEADLINE_CATEGORIES: ReadonlySet<Category> = new Set([
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
]);

export interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

interface NewsApiResponse {
  totalResults: number;
  articles: NewsApiArticle[];
}

/**
 * NewsAPI has two endpoints that each support half of our filters:
 * top-headlines takes a category but no dates, everything takes dates but
 * no category. Use top-headlines when we can, otherwise search everything
 * and fold the category into the keyword.
 */
export function buildNewsApiUrl(query: ArticleQuery, apiKey: string, baseUrl: string): string {
  const { keyword, category, from, to, page } = query;
  const hasDates = Boolean(from || to);
  const isHeadlineCategory = category !== undefined && HEADLINE_CATEGORIES.has(category);

  if (!hasDates && (isHeadlineCategory || (!keyword && !category))) {
    return buildUrl(baseUrl, 'top-headlines', {
      country: 'us',
      category,
      q: keyword,
      pageSize: PAGE_SIZE,
      page,
      apiKey,
    });
  }

  return buildUrl(baseUrl, 'everything', {
    // "everything" requires a search term.
    q: [keyword, category].filter(Boolean).join(' AND ') || 'news',
    from,
    to,
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: PAGE_SIZE,
    page,
    apiKey,
  });
}

export function mapNewsApiArticle(article: NewsApiArticle, category?: string): Article {
  return {
    id: `newsapi:${article.url}`,
    title: article.title,
    description: article.description ?? '',
    url: article.url,
    imageUrl: article.urlToImage ?? undefined,
    author: article.author ?? undefined,
    publishedAt: article.publishedAt,
    source: 'newsapi',
    outlet: article.source.name,
    category,
  };
}

/** NewsAPI keeps placeholders for deleted articles with the title "[Removed]". */
const isRemoved = (article: NewsApiArticle) => !article.title || article.title === '[Removed]';

export function createNewsApiSource({ apiKey, baseUrl }: SourceConfig): NewsSource {
  return {
    id: 'newsapi',
    name: 'NewsAPI',
    isConfigured: () => Boolean(apiKey),

    async fetchArticles(query, signal): Promise<SourceResult> {
      if (!apiKey) return { articles: [], hasMore: false };

      const data = await getJson<NewsApiResponse>('newsapi', buildNewsApiUrl(query, apiKey, baseUrl), signal);
      const total = Math.min(data.totalResults, MAX_RESULTS);
      return {
        articles: data.articles
          .filter((article) => !isRemoved(article))
          .map((article) => mapNewsApiArticle(article, query.category)),
        hasMore: query.page * PAGE_SIZE < total,
      };
    },
  };
}
