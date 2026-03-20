import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  url: string;
  meta?: { title?: string };
  excerpt?: string;
}

interface PagefindSearch {
  search: (query: string) => Promise<{
    results: Array<{
      data: () => Promise<SearchResult>;
    }>;
  }>;
  init: () => Promise<void>;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const pagefindRef = useRef<PagefindSearch | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      if (!pagefindRef.current) {
        // Use init promise to coalesce concurrent requests
        if (!initPromiseRef.current) {
          initPromiseRef.current = (async () => {
            // @ts-ignore - Pagefind is loaded from the built output
            pagefindRef.current = await import('/pagefind/pagefind.js');
            await pagefindRef.current.init();
          })();
        }
        await initPromiseRef.current;
      }
      const search = await pagefindRef.current.search(value);
      const data = await Promise.all(
        search.results.slice(0, 8).map(async (r) => {
          const result = await r.data();
          // Fix URLs that have /client prefix (pagefind extracts from file path)
          result.url = result.url.replace(/^\/client/, '');
          return result;
        })
      );
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
        aria-label="搜索"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">⌘K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-700">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索文章..."
                className="flex-1 py-3 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              <kbd className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">ESC</kbd>
            </div>

            {query.length >= 2 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {loading ? (
                  <p className="px-3 py-4 text-sm text-zinc-500 text-center">搜索中...</p>
                ) : results.length > 0 ? (
                  <ul>
                    {results.map((result, i) => (
                      <li key={i}>
                        <a
                          href={result.url}
                          className="block px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <p className="font-medium text-sm">{result.meta?.title || '无标题'}</p>
                          {result.excerpt && (
                            <p
                              className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: result.excerpt }}
                            />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-sm text-zinc-500 text-center">未找到相关文章</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
