import { useMemo } from 'react';
import { useArticles } from '../hooks/useArticles';
import { createTasks } from '../services/aggregator';
import { configuredSources } from '../sources/registry';
import ArticleList from './ArticleList';

/** Top stories from every configured source. Personalisation is added on top of this. */
export default function FeedView() {
  const tasks = useMemo(() => createTasks(configuredSources, [{}]), []);
  const { loadMore, ...result } = useArticles(tasks);

  return <ArticleList {...result} onLoadMore={loadMore} />;
}
