import type { LLMProvider } from './llmProvider';

export class OllamaProvider implements LLMProvider {
  name: string;
  private baseUrl: string;
  private modelName: string;
  constructor(baseUrl: string, modelName: string) {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
    this.name = `Ollama (${modelName})`;
  }
  isConfigured() { return !!this.baseUrl && !!this.modelName; }

  private normalizeUrl() {
    const t = this.baseUrl.trim().replace(/\/$/, '');
    return t.startsWith('http') ? t : `http://${t}`;
  }

  async *complete(systemPrompt: string, userMessage: string): AsyncGenerator<string> {
    if (!this.isConfigured()) { yield '[Ollama not configured — set Base URL and model in Settings]'; return; }
    const prompt = systemPrompt ? `${systemPrompt}\n\n${userMessage}` : userMessage;
    try {
      const res = await fetch(`${this.normalizeUrl()}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.modelName, prompt, stream: true }),
      });
      if (!res.ok || !res.body) { yield `[Ollama HTTP ${res.status}: ${res.statusText}]`; return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
          try {
            const obj = JSON.parse(line);
            if (obj.response) yield obj.response;
            if (obj.done) return;
          } catch { /* skip malformed */ }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'connection failed';
      yield `[Ollama error: ${msg}]`;
    }
  }
}
