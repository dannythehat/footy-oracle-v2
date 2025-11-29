import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  ws: WebSocket;
  subscribedFixtures: Set<number>;
}

class LiveScoreWebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, Client> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('✅ New WebSocket client connected');

      const client: Client = {
        ws,
        subscribedFixtures: new Set(),
      };
      this.clients.set(ws, client);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Footy Oracle live scores',
      }));
    });

    // Start periodic updates
    this.startPeriodicUpdates();

    console.log('🚀 WebSocket server initialized');
  }

  private handleMessage(client: Client, message: any) {
    switch (message.type) {
      case 'subscribe':
        if (message.fixtureId) {
          client.subscribedFixtures.add(message.fixtureId);
          console.log(`Client subscribed to fixture ${message.fixtureId}`);
        }
        break;

      case 'unsubscribe':
        if (message.fixtureId) {
          client.subscribedFixtures.delete(message.fixtureId);
          console.log(`Client unsubscribed from fixture ${message.fixtureId}`);
        }
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private startPeriodicUpdates() {
    // Update every 30 seconds
    this.updateInterval = setInterval(() => {
      this.fetchAndBroadcastUpdates();
    }, 30000);
  }

  private async fetchAndBroadcastUpdates() {
    // Get all unique fixture IDs that clients are subscribed to
    const subscribedFixtures = new Set<number>();
    this.clients.forEach((client) => {
      client.subscribedFixtures.forEach((fixtureId) => {
        subscribedFixtures.add(fixtureId);
      });
    });

    if (subscribedFixtures.size === 0) return;

    // Fetch live scores for subscribed fixtures
    // This would integrate with your API-Football service
    for (const fixtureId of subscribedFixtures) {
      try {
        const liveScore = await this.fetchLiveScore(fixtureId);
        if (liveScore) {
          this.broadcastToSubscribers(fixtureId, liveScore);
        }
      } catch (error) {
        console.error(`Failed to fetch live score for fixture ${fixtureId}:`, error);
      }
    }
  }

  private async fetchLiveScore(fixtureId: number): Promise<any> {
    // TODO: Integrate with API-Football to get real-time scores
    // For now, return mock data structure
    return {
      fixtureId,
      homeScore: 0,
      awayScore: 0,
      status: 'LIVE',
      elapsed: 45,
      events: [],
    };
  }

  private broadcastToSubscribers(fixtureId: number, data: any) {
    this.clients.forEach((client) => {
      if (client.subscribedFixtures.has(fixtureId)) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(data));
        }
      }
    });
  }

  // Manual broadcast method for external triggers
  broadcast(fixtureId: number, data: any) {
    this.broadcastToSubscribers(fixtureId, data);
  }

  shutdown() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
    this.clients.clear();
  }
}

export const wsService = new LiveScoreWebSocketService();
