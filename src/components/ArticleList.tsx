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
}

export default function ArticleList({
  articles,
  errors,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
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

      {!loading && articles.length === 0 && <p className="status">No articles found.</p>}

      {articles.length > 0 && (
        <>
          <div className="grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
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
