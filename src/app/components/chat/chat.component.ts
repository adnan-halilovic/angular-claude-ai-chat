import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaudeService } from '../../services/claude/claude.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  userInput = signal('');
  
  claudeService = inject(ClaudeService);

  // Computed signal to check if send button should be disabled
  isSendDisabled = computed(() => 
    !this.userInput().trim() || 
    this.claudeService.isLoading() ||
    !this.claudeService.context()
  );

  async sendMessage(): Promise<void> {
    const message = this.userInput().trim();
    if (message && !this.claudeService.isLoading()) {
      this.userInput.set('');
      await this.claudeService.sendMessage(message);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
