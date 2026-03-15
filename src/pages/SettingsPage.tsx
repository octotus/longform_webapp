import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { saveBackupSlot, getBackupSlots, downloadBackupSlot, clearBackupSlots, restoreFromPayload } from '../utils/backup';
import type { BackupSlot } from '../utils/backup';
import type { ProviderType } from '../types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    openAiKey, claudeKey, ollamaUrl, ollamaModel, activeProvider,
    ollamaModels, fetchingModels, fetchModelsError, theme,
    autoBackupInterval,
    setOpenAiKey, setClaudeKey, setOllamaUrl, setOllamaModel, setActiveProvider,
    fetchOllamaModels, setTheme, setAutoBackupInterval,
  } = useSettingsStore();

  const [saved, setSaved] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreOk, setRestoreOk] = useState(false);
  const [slots, setSlots] = useState<BackupSlot[]>([]);

  useEffect(() => { setSlots(getBackupSlots()); }, []);

  const handleBackupNow = useCallback(() => {
    saveBackupSlot();
    setSlots(getBackupSlots());
  }, []);

  const handleRestore = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError('');
    setRestoreOk(false);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        restoreFromPayload(reader.result as string);
        setRestoreOk(true);
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setRestoreError('Could not restore: file is invalid or corrupted.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const initial = useRef({ openAiKey, claudeKey, ollamaUrl, ollamaModel, activeProvider, theme, autoBackupInterval });
  const hasChanges =
    openAiKey !== initial.current.openAiKey ||
    claudeKey !== initial.current.claudeKey ||
    ollamaUrl !== initial.current.ollamaUrl ||
    ollamaModel !== initial.current.ollamaModel ||
    activeProvider !== initial.current.activeProvider ||
    theme !== initial.current.theme ||
    autoBackupInterval !== initial.current.autoBackupInterval;

  const handleSave = () => {
    initial.current = { openAiKey, claudeKey, ollamaUrl, ollamaModel, activeProvider, theme, autoBackupInterval };
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
        <button onClick={() => navigate('/')} className="text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">← Back</button>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Appearance */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Appearance</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Light
            </button>
          </div>
        </section>

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
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Ollama (Local)</h2>
            <p className="text-xs text-green-400 mt-1">No API key required — runs fully offline on your machine.</p>
          </div>
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

        {/* Backup & Restore */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Backup & Restore</h2>
            <p className="text-xs text-gray-500 mt-1">Backups are stored in the browser (up to 3 slots, newest first). Download any slot to keep an offline copy.</p>
          </div>

          {/* Backup slots */}
          <div className="space-y-2">
            {slots.length === 0 && <p className="text-xs text-gray-500 italic">No backups yet. Click "Backup Now" to create one.</p>}
            {slots.map((slot, i) => (
              <div key={slot.timestamp} className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded px-3 py-2">
                <div>
                  <span className="text-xs font-medium text-gray-300">{i === 0 ? 'Latest' : i === 1 ? 'Previous' : 'Oldest'}</span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(slot.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <button
                  onClick={() => { downloadBackupSlot(slot); clearBackupSlots(); setSlots([]); }}
                  className="text-xs text-blue-400 hover:text-blue-200 border border-blue-700 hover:border-blue-500 px-2 py-1 rounded transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleBackupNow}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium px-4 py-2 rounded transition-colors border border-gray-600"
            >
              Backup Now
            </button>
            <label className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium px-4 py-2 rounded transition-colors border border-gray-600 cursor-pointer">
              Restore from File
              <input type="file" accept=".likhitu" onChange={handleRestore} className="hidden" />
            </label>
          </div>

          {/* Auto-backup interval */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Auto-backup interval</label>
            <select
              value={autoBackupInterval}
              onChange={e => setAutoBackupInterval(Number(e.target.value) as 0 | 15 | 30 | 60 | 360)}
              className="bg-gray-700 border border-gray-600 text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={0}>Off</option>
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
              <option value={360}>Every 6 hours</option>
            </select>
            {autoBackupInterval > 0 && <p className="text-xs text-gray-500 mt-1">Saves silently to browser storage every {autoBackupInterval} min. Oldest slot is dropped when all 3 are full.</p>}
          </div>

          {restoreOk && <p className="text-xs text-green-400">Backup restored — reloading…</p>}
          {restoreError && <p className="text-xs text-red-400">{restoreError}</p>}
        </section>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saved}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
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
