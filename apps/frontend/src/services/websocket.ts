type LiveScoreCallback = (data: LiveScoreUpdate) => void;

export interface LiveScoreUpdate {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  status: string;
  elapsed: number;
  events?: MatchEvent[];
}

export interface MatchEvent {
  time: number;
  type: 'goal' | 'card' | 'substitution';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private subscribers: Map<number, Set<LiveScoreCallback>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: LiveScoreUpdate = JSON.parse(event.data);
          this.notifySubscribers(data.fixtureId, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(fixtureId: number, callback: LiveScoreCallback) {
    if (!this.subscribers.has(fixtureId)) {
      this.subscribers.set(fixtureId, new Set());
    }
    this.subscribers.get(fixtureId)!.add(callback);

    // Send subscription message to server
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        fixtureId,
      }));
    }

    // Return unsubscribe function
    return () => this.unsubscribe(fixtureId, callback);
  }

  unsubscribe(fixtureId: number, callback: LiveScoreCallback) {
    const callbacks = this.subscribers.get(fixtureId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(fixtureId);
        // Send unsubscribe message to server
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            fixtureId,
          }));
        }
      }
    }
  }

  private notifySubscribers(fixtureId: number, data: LiveScoreUpdate) {
    const callbacks = this.subscribers.get(fixtureId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export const wsService = new WebSocketService();
