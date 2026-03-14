export interface LLMProvider {
  name: string;
  isConfigured(): boolean;
  complete(systemPrompt: string, userMessage: string): AsyncGenerator<string>;
}

export type { ProviderType } from '../../types';
