export type SourceId = 'guardian' | 'nyt' | 'newsapi';

export const CATEGORIES = [
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
  'politics',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** The shape every source adapter converts its API response into. */
export interface Article {
  /** Prefixed with the source, e.g. "guardian:world/2026/oct/27/...", so ids never collide across APIs. */
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  author?: string;
  /** ISO 8601 timestamp. */
  publishedAt: string;
  source: SourceId;
  /** Publication name shown on the card. For NewsAPI this is the original outlet, e.g. "BBC News". */
  outlet: string;
  category?: string;
}

/** What the user is asking for. Dates are YYYY-MM-DD, the format of <input type="date">. */
export interface ArticleQuery {
  keyword?: string;
  category?: Category;
  from?: string;
  to?: string;
  page: number;
}
