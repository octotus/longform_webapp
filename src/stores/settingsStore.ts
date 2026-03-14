import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderType } from '../types';

interface SettingsState {
  openAiKey: string;
  claudeKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  activeProvider: ProviderType;
  ollamaModels: string[];
  fetchingModels: boolean;
  fetchModelsError: string | null;
  theme: 'dark' | 'light';
  autoBackupInterval: 0 | 15 | 30 | 60 | 360;
  setAutoBackupInterval: (n: 0 | 15 | 30 | 60 | 360) => void;
  setOpenAiKey: (k: string) => void;
  setClaudeKey: (k: string) => void;
  setOllamaUrl: (u: string) => void;
  setOllamaModel: (m: string) => void;
  setActiveProvider: (p: ProviderType) => void;
  fetchOllamaModels: () => Promise<void>;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      openAiKey: '',
      claudeKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      activeProvider: 'OPENAI',
      ollamaModels: [],
      fetchingModels: false,
      fetchModelsError: null,
      theme: 'dark',
      autoBackupInterval: 0,
      setAutoBackupInterval: (autoBackupInterval) => set({ autoBackupInterval }),
      setOpenAiKey: (openAiKey) => set({ openAiKey }),
      setClaudeKey: (claudeKey) => set({ claudeKey }),
      setOllamaUrl: (ollamaUrl) => set({ ollamaUrl }),
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
      setActiveProvider: (activeProvider) => set({ activeProvider }),
      setTheme: (theme) => set({ theme }),
      fetchOllamaModels: async () => {
        const url = get().ollamaUrl.trim().replace(/\/$/, '') + '/api/tags';
        set({ fetchingModels: true, fetchModelsError: null });
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const models = (data.models ?? []).map((m: any) => (m.name || m.model || '') as string).filter(Boolean);
          // Auto-select first model if current model isn't in the fetched list (B6)
          const currentModel = get().ollamaModel;
          const newModel = models.includes(currentModel) ? currentModel : (models[0] ?? currentModel);
          set({ ollamaModels: models, ollamaModel: newModel, fetchModelsError: models.length ? null : 'No models found' });
        } catch (e: any) {
          set({ fetchModelsError: `Could not reach Ollama: ${e.message}` });
        } finally {
          set({ fetchingModels: false });
        }
      },
    }),
    { name: 'longform-settings' }
  )
);
