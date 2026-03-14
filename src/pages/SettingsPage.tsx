import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import type { ProviderType } from '../types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    openAiKey, claudeKey, ollamaUrl, ollamaModel, activeProvider,
    ollamaModels, fetchingModels, fetchModelsError,
    setOpenAiKey, setClaudeKey, setOllamaUrl, setOllamaModel, setActiveProvider,
    fetchOllamaModels,
  } = useSettingsStore();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const PROVIDERS: { id: ProviderType; label: string }[] = [
    { id: 'OPENAI', label: 'OpenAI' },
    { id: 'CLAUDE', label: 'Claude (Anthropic)' },
    { id: 'OLLAMA', label: 'Ollama (Local)' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Active Provider */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Active AI Provider</h2>
          <div className="space-y-2">
            {PROVIDERS.map(p => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={activeProvider === p.id}
                  onChange={() => setActiveProvider(p.id)}
                  className="accent-blue-500"
                />
                <span className={`text-sm ${activeProvider === p.id ? 'text-white font-medium' : 'text-gray-400'}`}>{p.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* OpenAI */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">OpenAI</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API Key</label>
            <input
              type="password"
              value={openAiKey}
              onChange={e => setOpenAiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Claude */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Claude (Anthropic)</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API Key</label>
            <input
              type="password"
              value={claudeKey}
              onChange={e => setClaudeKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Ollama */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Ollama (Local)</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Base URL</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={e => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Model Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ollamaModel}
                onChange={e => setOllamaModel(e.target.value)}
                placeholder="llama3.2"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={fetchOllamaModels}
                disabled={fetchingModels}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 text-sm px-3 py-2 rounded transition-colors"
              >
                {fetchingModels ? '...' : 'Fetch Models'}
              </button>
            </div>
            {fetchModelsError && <p className="text-xs text-red-400 mt-1">{fetchModelsError}</p>}
            {ollamaModels.length > 0 && (
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">Available Models</label>
                <select
                  value={ollamaModel}
                  onChange={e => setOllamaModel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {ollamaModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Settings are stored locally in your browser via localStorage. API keys never leave your device.
        </p>
      </div>
    </div>
  );
}
