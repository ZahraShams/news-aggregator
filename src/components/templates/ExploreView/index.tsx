import { useMemo, useState } from 'react';
import { useArticles, useDebounce } from '../../../hooks';
import { createTasks } from '../../../services/aggregator';
import { configuredSources } from '../../../sources/registry';
import { DEFAULT_FILTERS, type Filters } from '../../../utils/filters';
import { SearchBar } from '../../atoms';
import { ArticleList, FilterPanel } from '../../molecules';

export default function ExploreView() {
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  // Wait until the user stops typing, so we don't send a request per keystroke.
  const debouncedKeyword = useDebounce(keyword.trim());

  const tasks = useMemo(() => {
    const selected = configuredSources.filter((source) => filters.sources.includes(source.id));
    const query = {
      keyword: debouncedKeyword || undefined,
      category: filters.category,
      from: filters.from,
      to: filters.to,
    };
    return createTasks(selected, [query]);
  }, [debouncedKeyword, filters]);

  const { loadMore, ...result } = useArticles(tasks);

  return (
    <>
      <div className="toolbar">
        <SearchBar value={keyword} onChange={setKeyword} />
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>
      {tasks.length === 0 ? (
        <p className="status">Select at least one source to see articles.</p>
      ) : (
        <ArticleList {...result} onLoadMore={loadMore} />
      )}
    </>
  );
}
