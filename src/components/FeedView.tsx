import { useMemo, useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { usePreferences } from '../hooks/usePreferences';
import { createTasks } from '../services/aggregator';
import { isByFollowedAuthor, prioritizeFollowed } from '../services/personalize';
import { configuredSources } from '../sources/registry';
import { capitalize } from '../utils/format';
import ArticleList from './ArticleList';
import Chip from './Chip';

interface FeedViewProps {
  onCustomize: () => void;
}

export default function FeedView({ onCustomize }: FeedViewProps) {
  const { preferences } = usePreferences();
  const { categories, authors } = preferences;
  const [followedOnly, setFollowedOnly] = useState(false);

  const selectedSources = useMemo(
    () => configuredSources.filter((source) => preferences.sources.includes(source.id)),
    [preferences.sources],
  );

  // One request per source and preferred category, or top stories when none are picked.
  const tasks = useMemo(() => {
    const queries = categories.length > 0 ? categories.map((category) => ({ category })) : [{}];
    return createTasks(selectedSources, queries);
  }, [selectedSources, categories]);

  const { loadMore, articles, ...result } = useArticles(tasks);

  const visibleArticles = useMemo(
    () =>
      followedOnly
        ? articles.filter((article) => isByFollowedAuthor(article, authors))
        : prioritizeFollowed(articles, authors),
    [articles, authors, followedOnly],
  );

  const summary = [
    categories.length > 0 ? categories.map(capitalize).join(', ') : 'Top stories',
    selectedSources.length > 0 ? `from ${selectedSources.map((source) => source.name).join(', ')}` : '',
    authors.length > 0 ? `· following ${authors.length} author${authors.length > 1 ? 's' : ''}` : '',
  ].join(' ');

  return (
    <>
      <div className="feed-summary">
        <div>
          <h1>Your feed</h1>
          <p>{summary}</p>
        </div>
        <div className="feed-summary__actions">
          {authors.length > 0 && (
            <Chip label="Followed authors only" selected={followedOnly} onToggle={() => setFollowedOnly(!followedOnly)} />
          )}
          <button type="button" className="button--primary" onClick={onCustomize}>
            Customize
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="status">
          Your feed has no sources.{' '}
          <button type="button" className="link" onClick={onCustomize}>
            Pick some
          </button>{' '}
          to get started.
        </p>
      ) : (
        <ArticleList
          {...result}
          articles={visibleArticles}
          onLoadMore={loadMore}
          isHighlighted={(article) => isByFollowedAuthor(article, authors)}
          emptyMessage={
            followedOnly
              ? 'None of the loaded articles are by authors you follow. Load more or turn the filter off.'
              : undefined
          }
        />
      )}
    </>
  );
}
