import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id?: number;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private stompClient: Client | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);

  messages$ = this.messagesSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();

  // http://localhost:8081/ws-chat (sans /api)
  private wsUrl = environment.apiUrl.replace('/api', '') + '/ws-chat';
  private apiUrl = environment.apiUrl + '/chat';
  /** True seulement quand la session STOMP est \u00e9tablie (handshake complet) */
  get isConnected(): boolean {
    return this.stompClient?.connected ?? false;
  }

  /** Called once on init to seed chat with DB history */
  setInitialHistory(messages: ChatMessage[]): void {
    if (this.messagesSubject.getValue().length === 0) {
      this.messagesSubject.next(messages);
    }
  }

  connect(): void {
    // Eviter de ré-activer si déjà actif
    if (this.stompClient?.active) return;

    const user = this.authService.user;
    if (!user) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${user.token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connectedSubject.next(true);

        // Subscribe to chatroom topic
        this.stompClient!.subscribe('/topic/chatroom', (message: IMessage) => {
          const chatMsg: ChatMessage = JSON.parse(message.body);
          const currentMessages = this.messagesSubject.getValue();

          if (chatMsg.type === 'JOIN') {
            // Add system notification
            const joinMsg: ChatMessage = {
              ...chatMsg,
              content: `${chatMsg.senderName} a rejoint le chat`,
              type: 'JOIN'
            };
            this.messagesSubject.next([...currentMessages, joinMsg]);
            // Add to online users
            const users = this.onlineUsersSubject.getValue();
            if (!users.includes(chatMsg.senderName)) {
              this.onlineUsersSubject.next([...users, chatMsg.senderName]);
            }
          } else {
            this.messagesSubject.next([...currentMessages, chatMsg]);
          }
        });

        // Notify others of join
        const joinPayload: ChatMessage = {
          senderEmail: user.email,
          senderName: user.fullName,
          senderRole: user.role,
          content: '',
          timestamp: new Date().toISOString(),
          type: 'JOIN'
        };
        this.stompClient!.publish({
          destination: '/app/chat.join',
          body: JSON.stringify(joinPayload)
        });
      },
      onDisconnect: () => {
        this.connectedSubject.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connectedSubject.next(false);
      }
    });

    this.stompClient.activate();
  }

  sendMessage(content: string): void {
    const user = this.authService.user;

    if (!user) return;

    // Double vérification: si le client existe mais n'est pas connecté, on reconnecte
    if (!this.stompClient || !this.stompClient.active) {
      console.warn('[Chat] stompClient absent — tentative de reconnexion...');
      this.connect();
      return;
    }

    const message: ChatMessage = {
      senderEmail: user.email,
      senderName: user.fullName,
      senderRole: user.role,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'CHAT'
    };

    try {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
    } catch (err) {
      // "There is no underlying STOMP connection" — connexion perdue, on reset + reconnecte
      console.error('[Chat] publish() failed:', err);
      this.connectedSubject.next(false);
      // Forcer la recréation du client
      this.stompClient = null;
      setTimeout(() => this.connect(), 1000);
    }
  }

  loadHistory(): Observable<ChatMessage[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.user?.token ?? ''}`
    });
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history`, { headers });
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
    this.connectedSubject.next(false);
    this.messagesSubject.next([]);
    this.onlineUsersSubject.next([]);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}
