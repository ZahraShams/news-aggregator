import type { Article } from '../types/article';
import { normalizeAuthor } from '../utils/format';

/**
 * True when a followed author is among the article's credited authors.
 * Bylines can list several people ("By Jane Doe and John Roe"), so this
 * checks whether the byline contains the name rather than equals it.
 */
export function isByFollowedAuthor(article: Article, followed: string[]): boolean {
  if (!article.author || followed.length === 0) return false;
  const byline = normalizeAuthor(article.author);
  return followed.some((name) => byline.includes(normalizeAuthor(name)));
}

/** Moves articles by followed authors to the top. Both groups keep their order. */
export function prioritizeFollowed(articles: Article[], followed: string[]): Article[] {
  if (followed.length === 0) return articles;
  const preferred = articles.filter((article) => isByFollowedAuthor(article, followed));
  const rest = articles.filter((article) => !isByFollowedAuthor(article, followed));
  return [...preferred, ...rest];
}
