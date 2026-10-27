import type { ReactNode } from 'react';
import { getSourceName } from '../sources/registry';
import type { Article, SourceId } from '../types/article';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  errors: Partial<Record<SourceId, string>>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isHighlighted?: (article: Article) => boolean;
  /** Shown when loading finished without results. */
  emptyMessage?: ReactNode;
}

export default function ArticleList({
  articles,
  errors,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  isHighlighted,
  emptyMessage = 'No articles found.',
}: ArticleListProps) {
  const failedSources = Object.entries(errors) as [SourceId, string][];

  return (
    <section aria-busy={loading}>
      {failedSources.map(([id, message]) => (
        <p key={id} className="notice notice--error" role="alert">
          <strong>{getSourceName(id)}:</strong> {message}
        </p>
      ))}

      {loading && <p className="status">Loading articles…</p>}

      {!loading && articles.length === 0 && <p className="status">{emptyMessage}</p>}

      {articles.length > 0 && (
        <>
          <div className="grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} highlighted={isHighlighted?.(article)} />
            ))}
          </div>
          {hasMore && (
            <button type="button" className="load-more" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
