import type { LLMProvider } from './llmProvider';

export class ClaudeProvider implements LLMProvider {
  name = 'Claude';
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  isConfigured() { return !!this.apiKey; }

  async *complete(systemPrompt: string, userMessage: string): AsyncGenerator<string> {
    if (!this.isConfigured()) { yield '[Anthropic API key not configured]'; return; }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] }),
    });
    if (!res.ok) { yield `[Claude error ${res.status}: ${res.statusText}]`; return; }
    const data = await res.json();
    yield data.content?.[0]?.text ?? '';
  }
}
