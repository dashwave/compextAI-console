import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { executionApi, Execution } from '../lib/api/execution';

interface Project {
  id: number;
  identifier: string;
  name: string;
  description: string;
}

interface ExecutionsTabProps {
  project: Project;
}

const statusIcons = {
  completed: <CheckCircle className="text-green-500" size={18} />,
  failed: <XCircle className="text-red-500" size={18} />,
  running: <Clock className="text-blue-500 animate-spin" size={18} />,
};

export function ExecutionsTab({ project }: ExecutionsTabProps) {
  const navigate = useNavigate();
  const { projectName } = useParams();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchExecutions();
  }, [project.name]);

  const fetchExecutions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await executionApi.list(project.name);
      setExecutions(data);
    } catch (err: any) {
      console.error('Error fetching executions:', err);
      setError(err.message || 'Failed to fetch executions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await executionApi.list(project.name);
      setExecutions(data);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing executions:', err);
      setError(err.message || 'Failed to refresh executions');
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

      <div className="space-y-4">
        {executions.map((execution) => (
          <div
            key={execution.identifier}
            onClick={() => navigate(`/project/${projectName}/executions/${execution.identifier}`)}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
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
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        ))}

        {executions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No executions found
          </div>
        )}
      </div>
    </div>
  );
}