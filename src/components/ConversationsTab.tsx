import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, ChevronRight, RefreshCw } from 'lucide-react';
import { threadApi, Thread } from '../lib/api-client';

interface Project {
  identifier: string;
  name: string;
  description: string;
}

interface ConversationsTabProps {
  project: Project;
}

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
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [project.name]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await threadApi.list(project.name);
      setThreads(data);
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.message || 'Failed to fetch threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await threadApi.list(project.name);
      setThreads(data);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing threads:', err);
      setError(err.message || 'Failed to refresh threads');
    } finally {
      setIsRefreshing(false);
    }
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

      <div className="space-y-4">
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
      </div>
    </div>
  );
}