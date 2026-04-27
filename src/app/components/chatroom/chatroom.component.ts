import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  isOpen = false;
  newMessage = '';
  unreadCount = 0;
  private shouldScrollToBottom = false;
  private messageSub?: Subscription;

  messages$ = this.chatService.messages$;
  connected$ = this.chatService.connected$;
  onlineUsers$ = this.chatService.onlineUsers$;

  get currentUser() {
    return this.authService.user;
  }

  /** Sync getter — true uniquement quand la session STOMP est établie */
  get isConnected(): boolean {
    return this.chatService.isConnected;
  }

  ngOnInit(): void {
    console.log('[Chat] Initialisation, user:', this.authService.user?.email);
    this.chatService.connect();

    this.chatService.connected$.subscribe(state =>
      console.log('[Chat] connected$ state:', state, '| isConnected:', this.chatService.isConnected)
    );

    this.chatService.loadHistory().subscribe({
      next: (history) => {
        console.log('[Chat] History loaded:', history.length, 'messages');
        this.chatService.setInitialHistory(history);
      },
      error: (err) => console.error('[Chat] Failed to load history:', err)
    });

    this.messageSub = this.messages$.subscribe(() => {
      if (!this.isOpen) {
        this.unreadCount++;
      }
      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.messageSub?.unsubscribe();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      this.shouldScrollToBottom = true;
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
    this.shouldScrollToBottom = true;
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAvatarColor(email: string): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
      '#f59e0b', '#10b981', '#3b82f6', '#ef4444'
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (_) {}
    }, 50);
  }
}
