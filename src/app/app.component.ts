import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { ContextComponent } from './components/context/context.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ChatComponent, ContextComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Claude AI Assistant';
  subtitle = 'Powered by Claude 4 Sonnet';
}
