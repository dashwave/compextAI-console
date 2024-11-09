import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { ApiError } from '../lib/api-client';

interface Project {
  id: number;
  identifier: string;
  name: string;
  description: string;
}

interface Execution {
  identifier: string;
  status: string;
  created_at: string;
  thread_id: string;
  thread: {
    identifier: string;
    title: string;
    metadata: Record<string, any>;
  };
  input_messages: Array<{
    role: string;
    content: string;
  }>;
  output: any;
  content: string;
  execution_response_metadata: Record<string, any>;
  execution_request_metadata: Record<string, any>;
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
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutions();
  }, [project.name]);

  const fetchExecutions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://compext-ai.dashwave.io/api/v1/threadexec/all/${project.name}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }
      
      const data = await response.json();
      setExecutions(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error fetching executions:', apiError);
      setError(apiError.message || 'Failed to fetch executions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <div className="space-y-4">
      {executions.map((execution) => (
        <div
          key={execution.identifier}
          onClick={() => navigate(`/executions/${execution.identifier}`)}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {statusIcons[execution.status as keyof typeof statusIcons] || 
               statusIcons.running}
              <div>
                <h3 className="text-lg font-medium">Execution {execution.identifier}</h3>
                <p className="text-sm text-gray-500">
                  Created at: {formatDate(execution.created_at)}
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
  );
}