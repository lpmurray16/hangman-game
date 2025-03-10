import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, Subject, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private apiUrl = 'wss://fastapi-supabase-sho6.onrender.com/ws'; // WebSocket URL

  constructor() {}

  // Connect to WebSocket server
  connect(): Observable<any> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.createWebSocketConnection();
    }
    
    return this.messagesSubject.asObservable();
  }

  // Send message to WebSocket server
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket connection not open');
      // Try to reconnect
      this.reconnect();
    }
  }

  // Close WebSocket connection
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Create WebSocket connection
  private createWebSocketConnection(): void {
    // Get auth token for authentication
    const token = localStorage.getItem('token');
    
    // Use the base URL without appending token as query parameter
    const wsUrl = this.apiUrl;
    
    console.log('Connecting to WebSocket at:', wsUrl);
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        
        // Send authentication message with token after connection is established
        const token = localStorage.getItem('token');
        if (token) {
          this.socket?.send(JSON.stringify({
            type: 'authenticate',
            token: token
          }));
          console.log('Authentication message sent');
        } else {
          console.warn('No authentication token available');
        }
      };
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.messagesSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        if (!event.wasClean) {
          this.reconnect();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.reconnect();
    }
  }

  // Attempt to reconnect to WebSocket server
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.createWebSocketConnection();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }
}
