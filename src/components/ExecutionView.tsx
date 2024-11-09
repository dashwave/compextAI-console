import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Bot, User, ArrowLeft, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { ApiError } from '../lib/api-client';

interface Message {
  role: string;
  content: string;
}

interface Execution {
  identifier: string;
  status: string;
  created_at: string;
  thread_id: string;
  input_messages: Message[];
  content: string;
  system_prompt?: string;
}

interface ExpandableMessageProps {
  content: string;
  isUser: boolean;
}

const MESSAGE_PREVIEW_LENGTH = 300;

function ExpandableMessage({ content, isUser }: ExpandableMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > MESSAGE_PREVIEW_LENGTH;

  const displayContent = shouldTruncate && !isExpanded
    ? content.slice(0, MESSAGE_PREVIEW_LENGTH) + '...'
    : content;

  return (
    <div className="w-full">
      <p className="whitespace-pre-wrap break-words">{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1 mt-2 text-sm ${
            isUser ? 'text-gray-600 hover:text-gray-800' : 'text-blue-100 hover:text-white'
          }`}
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Show more <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function ExecutionView() {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSystemPromptExpanded, setIsSystemPromptExpanded] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);

  useEffect(() => {
    fetchExecution();
  }, [executionId]);

  const fetchExecution = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://compext-ai.dashwave.io/api/v1/threadexec/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch execution details');
      }
      
      const data = await response.json();

      // Extract system prompt from input messages
      let systemPromptFromMessages = data.input_messages.find(
        (msg: Message) => msg.role === 'system'
      )?.content || null;

      // Override with execution's system_prompt if available
      if (data.system_prompt) {
        systemPromptFromMessages = data.system_prompt;
      }

      setSystemPrompt(systemPromptFromMessages);

      // Filter out system messages from input_messages
      data.input_messages = data.input_messages.filter(
        (msg: Message) => msg.role !== 'system'
      );

      setExecution(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error fetching execution:', apiError);
      setError(apiError.message || 'Failed to fetch execution details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back to the executions tab
    navigate('/', { state: { activeTab: 'executions' } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error || 'Execution not found'}</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Executions</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Execution {execution.identifier}</h1>
                <p className="text-sm text-gray-500">Created at: {formatDate(execution.created_at)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500">Thread ID: {execution.thread_id}</p>
                  {execution.thread_id !== 'compext_thread_null' && (
                    <Link
                      to="/"
                      state={{ activeTab: 'conversations', threadId: execution.thread_id }}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <MessageSquare size={14} />
                      <span>View Conversation</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {systemPrompt && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Context:</span>
                  <div className={`text-sm text-gray-600 mt-1`}>
                    <ExpandableMessage content={systemPrompt} isUser={false} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {execution.input_messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'} gap-3 max-w-[85%] ${
                  message.role === 'user' ? 'ml-0' : 'ml-auto'
                }`}
              >
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
                <div className={`flex flex-col ${message.role === 'user' ? 'items-start' : 'items-end'} flex-1`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <ExpandableMessage content={message.content} isUser={message.role === 'user'} />
                  </div>
                </div>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                )}
              </div>
            ))}

            {execution.content && (
              <>
                <hr className="border-gray-200 my-6" />
                <div className="flex justify-end gap-3 max-w-[85%] ml-auto">
                  <div className="flex flex-col items-end flex-1">
                    <div className="rounded-2xl px-4 py-3 bg-blue-600 text-white">
                      <ExpandableMessage content={execution.content} isUser={false} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}