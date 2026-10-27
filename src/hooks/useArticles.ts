import { useCallback, useEffect, useRef, useState } from 'react';
import { appendArticles, fetchPage, type AggregatedPage, type FetchTask } from '../services/aggregator';

interface Loaded extends AggregatedPage {
  /** The tasks these results belong to. When the caller passes new tasks, the results are stale. */
  tasks: FetchTask[];
  page: number;
}

/**
 * Loads the first page for a set of tasks and appends further pages on demand.
 * Callers must memoise `tasks` (useMemo): a new array starts a new search.
 */
export function useArticles(tasks: FetchTask[]) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchPage(tasks, 1, controller.signal).then((result) => {
      if (!controller.signal.aborted) setLoaded({ ...result, tasks, page: 1 });
    });

    // Cancels the previous search when the user changes it before it finishes.
    return () => controller.abort();
  }, [tasks]);

  const current = loaded?.tasks === tasks ? loaded : null;

  const loadMore = useCallback(() => {
    if (!current || loadingMore) return;
    const pending = tasks.filter((task) => current.moreKeys.includes(task.key));
    if (pending.length === 0) return;

    const controller = controllerRef.current;
    const nextPage = current.page + 1;
    setLoadingMore(true);

    fetchPage(pending, nextPage, controller?.signal).then((result) => {
      setLoadingMore(false);
      if (controller?.signal.aborted) return;
      setLoaded((prev) =>
        prev && prev.tasks === tasks
          ? {
              ...prev,
              page: nextPage,
              articles: appendArticles(prev.articles, result.articles),
              moreKeys: result.moreKeys,
              errors: { ...prev.errors, ...result.errors },
            }
          : prev,
      );
    });
  }, [current, loadingMore, tasks]);

  return {
    articles: current?.articles ?? [],
    errors: current?.errors ?? {},
    loading: current === null,
    loadingMore,
    hasMore: (current?.moreKeys.length ?? 0) > 0,
    loadMore,
  };
}
