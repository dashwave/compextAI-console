import React, { useState } from 'react';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileSettings() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [saving, setSaving] = useState(false);

  const apiToken = 'sk_live_31fcc9b1-4f33-4c3f-9436-xxxxxxxx';
  const maskedToken = apiToken.replace(/(.{8}).*(.{8})/, '$1********$2');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold mb-8">Profile Settings</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value="avi.aviral140"
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value="avi.aviral140@example.com"
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={maskedToken}
                    disabled
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="Enter your Anthropic API key"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}