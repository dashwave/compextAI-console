import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { SearchFilter } from './SearchFilter';
import { Pagination } from './Pagination';
import { executionApi, Execution } from '../lib/api/execution';

interface Project {
  id: number;
  identifier: string;
  name: string;
  description: string;
}

interface FilterTag {
  key: string;
  value: string;
}

interface ExecutionsTabProps {
  project: Project;
}

const PAGE_SIZE = 10;

const getStorageKey = (projectName: string) => `executions_tab_state_${projectName}`;

const statusIcons = {
  completed: <CheckCircle className="text-green-500" size={18} />,
  failed: <XCircle className="text-red-500" size={18} />,
  running: <Clock className="text-blue-500 animate-spin" size={18} />,
};

const LABEL_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

export function ExecutionsTab({ project }: ExecutionsTabProps) {
  const navigate = useNavigate();
  const { projectName } = useParams();
  const location = useLocation();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [totalExecutions, setTotalExecutions] = useState(0);
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
      fetchExecutions(query, activeFilters);
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
      fetchExecutions(searchQuery, filters);
    }
  }, [currentPage]);

  const fetchExecutions = async (search: string, activeFilters: FilterTag[]) => {
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

      const { executions: data, total } = await executionApi.list(project.name, {
        page: currentPage,
        limit: PAGE_SIZE,
        search,
        filters: filtersObject
      });

      setExecutions(data);
      setTotalExecutions(total);
    } catch (err: any) {
      console.error('Error fetching executions:', err);
      setError(err.message || 'Failed to fetch executions');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchExecutions(searchQuery, filters);
    } catch (err: any) {
      console.error('Error refreshing executions:', err);
      setError(err.message || 'Failed to refresh executions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string, newFilters: FilterTag[]) => {
    setSearchQuery(query);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchExecutions(query, newFilters);
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
        <h2 className="text-lg font-medium">Executions</h2>
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
          placeholder="Search executions by ID or thread ID..."
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
            {executions.map((execution) => (
              <div
                key={execution.identifier}
                onClick={() => navigate(`/project/${projectName}/executions/${execution.identifier}`)}
                className="app-card group"
              >
                <div className="app-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {statusIcons[execution.status as keyof typeof statusIcons] || 
                       statusIcons.running}
                      <div>
                        <h3 className="text-lg font-medium">Execution {execution.identifier}</h3>
                        <p className="text-sm text-gray-500">
                          Created at: {new Date(execution.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Thread ID: {execution.thread_id}
                        </p>
                        {execution.metadata && Object.keys(execution.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(execution.metadata).map(([key, value], i) => (
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
                        {execution.thread_execution_params_template?.model && (
                          <p className="text-sm text-gray-500">
                            Model: {execution.thread_execution_params_template.model}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                        execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                      </span>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="app-card-overlay" />
              </div>
            ))}

            {executions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No executions found
              </div>
            )}
          </>
        )}
      </div>

      {totalExecutions > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={totalExecutions}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}