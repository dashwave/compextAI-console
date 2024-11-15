import React, { useState, useEffect, useRef } from 'react';
import { threadApi, Message, ApiError } from '../lib/api-client';
import { Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollButtons } from './ScrollButtons';

interface ConversationViewProps {
  threadId: string;
  onClose: () => void;
}

interface ExpandableMessageProps {
  content: string;
  isUser: boolean;
}

const MESSAGE_PREVIEW_LENGTH = 300;

function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function isCodeBlock(str: string): boolean {
  return str.includes('```') || 
         /^(function|const|let|var|import|export|class|if|for|while)\s/.test(str) ||
         /{[\s\S]*}/.test(str);
}

function formatContent(content: string): JSX.Element {
  if (isJSON(content)) {
    try {
      const json = JSON.parse(content);
      return (
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto max-w-full">
          <code className="break-words whitespace-pre-wrap">{JSON.stringify(json, null, 2)}</code>
        </pre>
      );
    } catch {
      return <p className="break-words whitespace-pre-wrap">{content}</p>;
    }
  }

  if (isCodeBlock(content)) {
    const code = content.includes('```') 
      ? content.replace(/```(\w+)?\n([\s\S]*?)```/g, '$2').trim()
      : content;

    return (
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto max-w-full">
        <code className="break-words whitespace-pre-wrap">{code}</code>
      </pre>
    );
  }

  return <p className="break-words whitespace-pre-wrap">{content}</p>;
}

function ExpandableMessage({ content, isUser }: ExpandableMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > MESSAGE_PREVIEW_LENGTH;

  const displayContent = shouldTruncate && !isExpanded
    ? content.slice(0, MESSAGE_PREVIEW_LENGTH) + '...'
    : content;

  return (
    <div className="w-full overflow-hidden">
      {formatContent(displayContent)}
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

export function ConversationView({ threadId, onClose }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await threadApi.getMessages(threadId);
      setMessages(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
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

  const systemMessages = messages.filter(msg => msg.role === 'system');
  const chatMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <div className="flex flex-col h-full">
      {systemMessages.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200 p-4 mb-4">
          <div className="max-w-3xl mx-auto">
            {systemMessages.map((msg, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Context:</span>{' '}
                <ExpandableMessage content={msg.content} isUser={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {chatMessages.map((message, index) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={index}
              className={`flex ${isUser ? 'justify-start' : 'justify-end'} gap-3 max-w-[85%] ${isUser ? 'ml-0' : 'ml-auto'}`}
            >
              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
              <div 
                className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} flex-1`}
              >
                <div
                  className={`w-full rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
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
      </div>
      <ScrollButtons containerRef={containerRef} />
    </div>
  );
}