import { memo } from 'react';
import type { Article } from '../types/article';
import { timeAgo } from '../utils/format';

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="card">
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
        {article.author && <p className="card__author">{article.author}</p>}
      </div>
    </article>
  );
}

export default memo(ArticleCard);
