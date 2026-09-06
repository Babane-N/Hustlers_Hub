import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

interface Conversation {
  id: string;
  customerId: string;
  businessId: string;
  businessName: string;
  customerName: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
}

interface SendMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];

  selectedConversation: Conversation | null = null;
  messages: Message[] = [];

  searchTerm = '';
  newMessage = '';

  loadingConversations = false;
  loadingMessages = false;
  sendingMessage = false;

  showConversationList = true;

  private shouldScrollToBottom = false;

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const businessId = params['businessId'];

      this.loadConversations(businessId);
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ============================================================
  // AUTH
  // ============================================================

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  loadConversations(businessId?: string): void {
    this.loadingConversations = true;

    this.http.get<Conversation[]>(
      `${this.apiUrl}/conversations`,
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({
      next: (conversations) => {

        this.conversations = conversations ?? [];

        this.filterConversations();

        this.loadingConversations = false;

        // Open conversation from Service Detail
        if (businessId) {
          this.openBusinessConversation(businessId);
        }
     
        /*
         * If a conversation was already selected,
         * refresh its reference from the new list.
         */
        if (this.selectedConversation) {

          const updated = this.conversations.find(
            c => c.id === this.selectedConversation?.id
          );

          if (updated) {
            this.selectedConversation = updated;
          }
        }
      },

      error: (error) => {
        console.error(
          'Error loading conversations:',
          error
        );

        this.conversations = [];
        this.filteredConversations = [];

        this.loadingConversations = false;
      }
    });
  }

  // ============================================================
  // OPEN / CREATE BUSINESS CONVERSATION
  // ============================================================

  openBusinessConversation(businessId: string): void {

    // Check if conversation already exists
    const existingConversation =
      this.conversations.find(
        conversation =>
          conversation.businessId === businessId
      );

    if (existingConversation) {

      this.selectConversation(
        existingConversation
      );

      return;
    }

    // No conversation exists yet.
    // Ask backend to create one.
    this.http.post<Conversation>(
      `${this.apiUrl}/conversations/business/${businessId}`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({

      next: (conversation) => {

        // Add conversation to local list
        this.conversations.unshift(
          conversation
        );

        this.filterConversations();

        // Open it
        this.selectConversation(
          conversation
        );
      },

      error: (error) => {

        console.error(
          'Error creating conversation:',
          error
        );
      }
    });
  }
  // ============================================================
  // SEARCH
  // ============================================================

  filterConversations(): void {

    const term = this.searchTerm
      .trim()
      .toLowerCase();

    if (!term) {
      this.filteredConversations = [
        ...this.conversations
      ];

      return;
    }

    this.filteredConversations =
      this.conversations.filter(conversation =>
        conversation.businessName
          ?.toLowerCase()
          .includes(term)
        ||
        conversation.customerName
          ?.toLowerCase()
          .includes(term)
        ||
        conversation.lastMessage
          ?.toLowerCase()
          .includes(term)
      );
  }

  // ============================================================
  // SELECT CONVERSATION
  // ============================================================

  selectConversation(
    conversation: Conversation
  ): void {

    this.selectedConversation = conversation;

    this.messages = [];

    this.showConversationList = false;

    this.loadMessages(conversation.id);
  }

  // ============================================================
  // LOAD MESSAGES
  // ============================================================

  loadMessages(conversationId: string): void {

    this.loadingMessages = true;

    this.http.get<Message[]>(
      `${this.apiUrl}/messages/conversation/${conversationId}`,
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({
      next: (messages) => {

        this.messages = messages ?? [];

        this.loadingMessages = false;

        this.shouldScrollToBottom = true;

        this.markAsRead(conversationId);
      },

      error: (error) => {

        console.error(
          'Error loading messages:',
          error
        );

        this.messages = [];

        this.loadingMessages = false;
      }
    });
  }

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  sendMessage(): void {

    if (
      !this.selectedConversation ||
      !this.newMessage.trim() ||
      this.sendingMessage
    ) {
      return;
    }

    const messageText =
      this.newMessage.trim();

    this.sendingMessage = true;

    const body = {
      messageText
    };

    this.http.post<SendMessageResponse>(
      `${this.apiUrl}/messages/conversation/${this.selectedConversation.id}`,
      body,
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({
      next: (response) => {

        this.messages.push(response);

        this.newMessage = '';

        this.sendingMessage = false;

        this.shouldScrollToBottom = true;

        /*
         * Update conversation preview immediately
         * rather than waiting for another API request.
         */
        const conversation =
          this.conversations.find(
            c => c.id === this.selectedConversation?.id
          );

        if (conversation) {

          conversation.lastMessage =
            response.messageText;

          conversation.lastMessageAt =
            response.sentAt;
        }

        this.filterConversations();
      },

      error: (error) => {

        console.error(
          'Error sending message:',
          error
        );

        this.sendingMessage = false;

      }
    });
  }

  // ============================================================
  // ENTER TO SEND
  // ============================================================

  handleMessageKeydown(
    event: KeyboardEvent
  ): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      this.sendMessage();
    }
  }

  // ============================================================
  // MARK AS READ
  // ============================================================

  markAsRead(
    conversationId: string
  ): void {

    this.http.put(
      `${this.apiUrl}/messages/conversation/${conversationId}/read`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({
      next: () => {

        const conversation =
          this.conversations.find(
            c => c.id === conversationId
          );

        if (conversation) {
          conversation.unreadCount = 0;
        }

        this.filterConversations();
      },

      error: (error) => {
        console.error(
          'Error marking messages as read:',
          error
        );
      }
    });
  }

  // ============================================================
  // BACK TO CONVERSATIONS
  // ============================================================

  backToConversations(): void {
    this.showConversationList = true;
  }

  // ============================================================
  // TOTAL UNREAD
  // ============================================================

  get totalUnread(): number {

    return this.conversations.reduce(
      (total, conversation) =>
        total + (conversation.unreadCount || 0),
      0
    );
  }

  // ============================================================
  // CURRENT USER
  // ============================================================

  private getCurrentUserId(): string | null {

    /*
     * Your AuthController returns:
     *
     * user.id
     *
     * If your login service already stores the user
     * differently, this can be adjusted later.
     */

    try {

      const storedUser =
        localStorage.getItem('user');

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return user.id ?? null;

    } catch {

      return null;
    }
  }

  // ============================================================
  // MESSAGE OWNERSHIP
  // ============================================================

  isOwnMessage(message: Message): boolean {

    const currentUserId =
      this.getCurrentUserId();

    return !!currentUserId &&
      message.senderId === currentUserId;
  }

  // ============================================================
  // PARTICIPANT NAME
  // ============================================================

  getConversationName(
    conversation: Conversation
  ): string {

    /*
     * For a customer:
     * show the business name.
     *
     * For a business:
     * show the customer's name.
     *
     * We determine this from the
     * currently logged-in user's ID.
     */

    const currentUserId =
      this.getCurrentUserId();

    if (
      currentUserId &&
      conversation.customerId === currentUserId
    ) {
      return conversation.businessName;
    }

    return conversation.customerName;
  }

  // ============================================================
  // PARTICIPANT INITIAL
  // ============================================================

  getInitials(name: string | undefined): string {

    if (!name) {
      return '?';
    }

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  formatConversationTime(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '';
    }

    const messageDate =
      new Date(date);

    const now = new Date();

    const isToday =
      messageDate.toDateString() ===
      now.toDateString();

    if (isToday) {

      return messageDate.toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
    }

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );

    if (
      messageDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString(
      [],
      {
        day: 'numeric',
        month: 'short'
      }
    );
  }

  // ============================================================
  // FORMAT MESSAGE TIME
  // ============================================================

  formatMessageTime(
    date: string
  ): string {

    return new Date(date)
      .toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }

  // ============================================================
  // SCROLL
  // ============================================================

  private scrollToBottom(): void {

    if (!this.messagesContainer) {
      return;
    }

    const element =
      this.messagesContainer.nativeElement;

    element.scrollTop =
      element.scrollHeight;
  }

  // ============================================================
  // TRACK BY
  // ============================================================

  trackConversation(
    index: number,
    conversation: Conversation
  ): string {

    return conversation.id;
  }

  trackMessage(
    index: number,
    message: Message
  ): string {

    return message.id;
  }
}
