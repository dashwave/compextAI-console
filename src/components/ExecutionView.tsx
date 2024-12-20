import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, User, ChevronDown, ChevronUp, Link as LinkIcon, Settings } from 'lucide-react';
import { executionApi, Execution } from '../lib/api/execution';

interface ExpandableMessageProps {
  content: string;
  isUser: boolean;
}

interface ExpandableJsonProps {
  data: Record<string, any>;
  title: string;
}

const MESSAGE_PREVIEW_LENGTH = 300;

function ExpandableJson({ data, title }: ExpandableJsonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isExpanded && (
        <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

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
      if (typeof data.input_messages === 'object'){
        data.input_messages = []
      }
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
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Executions</span>
        </button>

        <div className="space-y-6">
          {/* Execution Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-semibold">Execution {execution.identifier}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created at: {new Date(execution.created_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500">Thread ID: {execution.thread_id}</p>
                  {execution.thread_id !== 'compext_thread_null' && (
                    <button
                      onClick={() => navigate(`/project/${projectName}/threads/${execution.thread_id}`)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <LinkIcon size={14} />
                      <span>View Thread</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Execution Parameters */}
            {execution.thread_execution_params_template && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={18} className="text-gray-500" />
                  <h2 className="text-lg font-medium">Execution Parameters</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Model</span>
                    <span className="font-medium">{execution.thread_execution_params_template.model}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Temperature</span>
                    <span className="font-medium">{execution.thread_execution_params_template.temperature}</span>
                  </div>
                  {execution.thread_execution_params_template.max_tokens && (
                    <div>
                      <span className="text-sm text-gray-500 block">Max Tokens</span>
                      <span className="font-medium">{execution.thread_execution_params_template.max_tokens}</span>
                    </div>
                  )}
                  {execution.thread_execution_params_template.max_completion_tokens && (
                    <div>
                      <span className="text-sm text-gray-500 block">Max Completion Tokens</span>
                      <span className="font-medium">{execution.thread_execution_params_template.max_completion_tokens}</span>
                    </div>
                  )}
                  {execution.thread_execution_params_template.top_p && (
                    <div>
                      <span className="text-sm text-gray-500 block">Top P</span>
                      <span className="font-medium">{execution.thread_execution_params_template.top_p}</span>
                    </div>
                  )}
                  {execution.thread_execution_params_template.max_output_tokens && (
                    <div>
                      <span className="text-sm text-gray-500 block">Max Output Tokens</span>
                      <span className="font-medium">{execution.thread_execution_params_template.max_output_tokens}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Conversation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {systemPrompt && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="max-w-3xl mx-auto">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">System Prompt: </span>
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
                        {
                          // check if the content is a string by checking instanceType
                          typeof message.content === 'string' ? (
                            <ExpandableMessage content={message.content} isUser={isUser} />
                          ) : (
                            typeof message.content === 'object' ? (
                              <ExpandableMessage content={JSON.stringify(message.content)} isUser={isUser} />
                            ) : (
                              <div>Could not render content of this message</div>
                            )
                          )
                        }
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

          {/* Metadata Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-medium mb-4">Additional Information</h2>
            
            {execution.thread_execution_params_template?.response_format && (
              <ExpandableJson 
                data={execution.thread_execution_params_template.response_format} 
                title="Response Format"
              />
            )}
            
            {execution.execution_response_metadata && (
              <ExpandableJson 
                data={execution.execution_response_metadata} 
                title="Response Metadata"
              />
            )}
            
            {execution.execution_request_metadata && (
              <ExpandableJson 
                data={execution.execution_request_metadata} 
                title="Request Metadata"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}