import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaudeService } from '../../services/claude/claude.service';

@Component({
  selector: 'app-context',
  imports: [CommonModule, FormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss',
})
export class ContextComponent {
  contextInput = signal('');
  isEditing = signal(false);

  claudeService = inject(ClaudeService);

  saveContext(): void {
    const content = this.contextInput().trim();
    if (content) {
      this.claudeService.setContext(content);
      this.isEditing.set(false);
    }
  }

  editContext(): void {
    const currentContext = this.claudeService.context();
    if (currentContext) {
      this.contextInput.set(currentContext.content);
    }
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    const currentContext = this.claudeService.context();
    this.contextInput.set(currentContext ? currentContext.content : '');
  }

  clearContext(): void {
    if (
      confirm(
        'Are you sure you want to clear the context? This will also clear the chat history.'
      )
    ) {
      this.claudeService.clearContext();
      this.contextInput.set('');
      this.isEditing.set(false);
    }
  }
}
