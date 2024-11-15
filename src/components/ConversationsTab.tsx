import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MessageSquare, ChevronRight, RefreshCw } from 'lucide-react';
import { SearchFilter } from './SearchFilter';
import { Pagination } from './Pagination';
import { threadApi, Thread } from '../lib/api/conversation';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

interface FilterTag {
  key: string;
  value: string;
}

interface ConversationsTabProps {
  project: Project;
}

const PAGE_SIZE = 10;

const getStorageKey = (projectName: string) => `conversations_tab_state_${projectName}`;

const LABEL_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

export function ConversationsTab({ project }: ConversationsTabProps) {
  const navigate = useNavigate();
  const { projectName } = useParams();
  const location = useLocation();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [totalThreads, setTotalThreads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterTag[]>([]);
  const initialized = useRef(false);

  // Load saved state and initialize data
  useEffect(() => {
    const loadSavedState = () => {
      const savedState = sessionStorage.getItem(getStorageKey(project.name));
      if (savedState) {
        try {
          const { page, query, activeFilters } = JSON.parse(savedState);
          setCurrentPage(page || 1);
          setSearchQuery(query || '');
          setFilters(activeFilters || []);
          return { query: query || '', activeFilters: activeFilters || [] };
        } catch (error) {
          console.error('Error parsing saved state:', error);
        }
      }
      return { query: '', activeFilters: [] };
    };

    if (!initialized.current) {
      const { query, activeFilters } = loadSavedState();
      fetchThreads(query, activeFilters);
      initialized.current = true;
    }
  }, [project.name]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (initialized.current) {
      const state = {
        page: currentPage,
        query: searchQuery,
        activeFilters: filters
      };
      sessionStorage.setItem(getStorageKey(project.name), JSON.stringify(state));
    }
  }, [currentPage, searchQuery, filters, project.name]);

  // Handle page changes
  useEffect(() => {
    if (initialized.current && !isLoading) {
      fetchThreads(searchQuery, filters);
    }
  }, [currentPage]);

  const fetchThreads = async (search: string, activeFilters: FilterTag[]) => {
    try {
      const isInitialLoad = !search && activeFilters.length === 0;
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);

      const filtersObject = activeFilters.reduce((acc, filter) => ({
        ...acc,
        [filter.key]: filter.value
      }), {});

      const { threads: data, total } = await threadApi.list(project.name, {
        page: currentPage,
        limit: PAGE_SIZE,
        search,
        filters: filtersObject
      });

      setThreads(data);
      setTotalThreads(total);
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.message || 'Failed to fetch threads');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchThreads(searchQuery, filters);
    } catch (err: any) {
      console.error('Error refreshing threads:', err);
      setError(err.message || 'Failed to refresh threads');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string, newFilters: FilterTag[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchThreads(query, newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Conversations</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="mb-6">
        <SearchFilter
          onSearch={handleSearch}
          placeholder="Search conversations by title or ID..."
          initialQuery={searchQuery}
          initialFilters={filters}
        />
      </div>

      <div className="space-y-4">
        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {threads.map((thread) => (
              <div
                key={thread.identifier}
                onClick={() => navigate(`/project/${projectName}/threads/${thread.identifier}`)}
                className="app-card group"
              >
                <div className="app-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="text-blue-600 mt-1" size={20} />
                      <div>
                        <h3 className="text-lg font-medium">{thread.title}</h3>
                        <p className="text-sm text-gray-500">ID: {thread.identifier}</p>
                        {thread.metadata && Object.keys(thread.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(thread.metadata).map(([key, value], i) => (
                              <span
                                key={key}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  LABEL_COLORS[i % LABEL_COLORS.length]
                                }`}
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                <div className="app-card-overlay" />
              </div>
            ))}

            {threads.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No conversations found
              </div>
            )}
          </>
        )}
      </div>

      {totalThreads > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={totalThreads}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}