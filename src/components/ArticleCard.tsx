import { memo } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import type { Article } from '../types/article';
import { cleanAuthor, timeAgo } from '../utils/format';

interface ArticleCardProps {
  article: Article;
  /** Set for articles by authors the reader follows. */
  highlighted?: boolean;
}

function ArticleCard({ article, highlighted = false }: ArticleCardProps) {
  const { isFollowing, toggleFollow } = usePreferences();
  const author = article.author;
  const following = author ? isFollowing(author) : false;

  return (
    <article className={highlighted ? 'card card--highlighted' : 'card'}>
      {article.imageUrl && (
        <img className="card__image" src={article.imageUrl} alt="" loading="lazy" />
      )}
      <div className="card__body">
        <div className="card__meta">
          <span className={`badge badge--${article.source}`}>{article.outlet}</span>
          {article.category && <span>{article.category}</span>}
          <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
        </div>
        <h3 className="card__title">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        {article.description && <p className="card__description">{article.description}</p>}
        {author && (
          <div className="card__footer">
            <span className="card__author">{cleanAuthor(author)}</span>
            <button
              type="button"
              className={following ? 'follow follow--active' : 'follow'}
              aria-pressed={following}
              onClick={() => toggleFollow(author)}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(ArticleCard);
