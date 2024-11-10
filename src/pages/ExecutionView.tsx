import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, User, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { executionApi, Execution } from '../lib/api/execution';

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
    <div className="w-full overflow-hidden">
      <p className="break-words whitespace-pre-wrap">{displayContent}</p>
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
  const { executionId, projectName } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (executionId) {
      fetchExecution();
    }
  }, [executionId]);

  const fetchExecution = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await executionApi.get(executionId!);
      setExecution(data);

      // Handle system prompt
      const systemMessage = data.input_messages.find(msg => msg.role === 'system');
      setSystemPrompt(data.system_prompt || (systemMessage ? systemMessage.content : null));
    } catch (err: any) {
      console.error('Error fetching execution:', err);
      setError(err.message || 'Failed to fetch execution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/project/${projectName}/executions`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600">{error || 'Execution not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  const messages = execution.input_messages.filter(msg => msg.role !== 'system');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Executions</span>
          </button>

          {execution.thread_id && execution.thread_id !== 'compext_thread_null' && (
            <button
              onClick={() => navigate(`/project/${projectName}/threads/${execution.thread_id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <LinkIcon size={18} />
              <span>View Thread</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold">Execution {execution.identifier}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created at: {new Date(execution.created_at).toLocaleString()}
            </p>
          </div>

          {systemPrompt && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="max-w-3xl mx-auto">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Context: </span>
                  <ExpandableMessage content={systemPrompt} isUser={false} />
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'} gap-3 max-w-[85%] ${
                    isUser ? 'ml-0' : 'ml-auto'
                  }`}
                >
                  {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                  <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} flex-1`}>
                    <div
                      className={`w-full rounded-2xl px-4 py-3 ${
                        isUser ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'
                      }`}
                    >
                      <ExpandableMessage content={message.content} isUser={isUser} />
                    </div>
                  </div>
                  {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {execution.content && (
              <div className="flex justify-end gap-3 max-w-[85%] ml-auto">
                <div className="flex flex-col items-end flex-1">
                  <div className="w-full rounded-2xl px-4 py-3 bg-blue-600 text-white">
                    <ExpandableMessage content={execution.content} isUser={false} />
                  </div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot size={16} className="text-blue-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}