import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ConversationView } from '../components/ConversationView';

export function ThreadView() {
  const { threadId, projectName } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/project/${projectName}/conversations`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Conversations</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {threadId && <ConversationView threadId={threadId} onClose={handleBack} />}
        </div>
      </div>
    </div>
  );
}