import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatService, ChatMessage } from './chat.service';
import { AuthService } from './auth.service';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  const mockAuthService = {
    user: { email: 'dev@test.com', fullName: 'Test Dev', role: 'DEVELOPER', token: 'fake-token' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChatService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load history', () => {
    const dummyHistory: ChatMessage[] = [
      { senderEmail: 'dev@test.com', senderName: 'Dev 1', senderRole: 'DEVELOPER', content: 'Hi', type: 'CHAT', timestamp: new Date().toISOString() }
    ];

    service.loadHistory().subscribe(history => {
      expect(history.length).toBe(1);
      expect(history).toEqual(dummyHistory);
    });

    const req = httpMock.expectOne((request) => request.url.includes('/chat/history'));
    expect(req.request.method).toBe('GET');
    req.flush(dummyHistory);
  });

  it('should set initial history', () => {
    const dummyHistory: ChatMessage[] = [
      { senderEmail: 'dev@test.com', senderName: 'Dev 1', senderRole: 'DEVELOPER', content: 'Init', type: 'CHAT', timestamp: new Date().toISOString() }
    ];

    service.setInitialHistory(dummyHistory);
    
    service.messages$.subscribe(messages => {
      expect(messages).toEqual(dummyHistory);
    });
  });

  it('should clear messages', () => {
    service.clearMessages();
    service.messages$.subscribe(messages => {
      expect(messages.length).toBe(0);
    });
  });
});
