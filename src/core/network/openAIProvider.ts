import type { LLMProvider } from './llmProvider';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  isConfigured() { return !!this.apiKey; }

  async *complete(systemPrompt: string, userMessage: string): AsyncGenerator<string> {
    if (!this.isConfigured()) { yield '[OpenAI API key not configured]'; return; }
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', stream: false, max_tokens: 1000, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] }),
    });
    if (!res.ok) { yield `[OpenAI error ${res.status}: ${res.statusText}]`; return; }
    const data = await res.json();
    yield data.choices?.[0]?.message?.content ?? '';
  }
}
