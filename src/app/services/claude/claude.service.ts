import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClaudeService {
  private apiKey = environment.anthropicApiKey;
  // private apiUrl = 'https://api.anthropic.com/v1/messages';
  private apiUrl = '/api/messages';
  
  // Signals for reactive state management
  messages = signal<Message[]>([]);
  context = signal<ChatContext | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  setContext(content: string): void {
    this.context.set({
      content,
      timestamp: new Date()
    });
    // Clear messages when context changes
    this.messages.set([]);
  }

  async sendMessage(userMessage: string): Promise<void> {
    if (!this.apiKey || this.apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
      this.error.set('Please configure your Anthropic API key in the environment file');
      return;
    }

    // Add user message to the chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    this.messages.update(messages => [...messages, newUserMessage]);
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Prepare the system message with context
      const systemMessage = this.context() 
        ? `You are a helpful assistant. Please answer questions based on the following context:\n\n${this.context()?.content}`
        : 'You are a helpful assistant.';

      // Prepare messages for the API
      const apiMessages = this.messages().map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemMessage,
          messages: apiMessages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Claude');
      }

      const data = await response.json();
      
      // Add assistant's response to the chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content[0].text,
        timestamp: new Date()
      };
      
      this.messages.update(messages => [...messages, assistantMessage]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      this.isLoading.set(false);
    }
  }

  clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  clearContext(): void {
    this.context.set(null);
    this.clearChat();
  }
}
