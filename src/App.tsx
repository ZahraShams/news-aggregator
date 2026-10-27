import { useMemo } from 'react';
import ArticleList from './components/ArticleList';
import { useArticles } from './hooks/useArticles';
import { createTasks } from './services/aggregator';
import { configuredSources } from './sources/registry';

function App() {
  // Top stories from every source that has an API key.
  const tasks = useMemo(() => createTasks(configuredSources, [{}]), []);
  const { loadMore, ...result } = useArticles(tasks);

  return (
    <main className="page">
      <h1>News Aggregator</h1>
      <ArticleList {...result} onLoadMore={loadMore} />
    </main>
  );
}

export default App;
