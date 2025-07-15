import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

// Stream message types
export interface StreamMessage {
  type: 'post_update' | 'sentiment_change' | 'ai_insight' | 'user_activity' | 'metric_update';
  data: any;
  timestamp: Date;
  channel: string;
}

export interface StreamSubscription {
  channel: string;
  filters?: {
    topics?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    timeRange?: number;
  };
}

interface StreamClient {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  authenticated: boolean;
  lastActivity: Date;
}

export class StreamingServer {
  private wss: WebSocketServer;
  private clients: Map<string, StreamClient>;
  private channels: Map<string, Set<string>>;
  private streamingInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();
    this.channels = new Map();
    this.setupEventHandlers();
    this.startDataStreaming();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const client: StreamClient = {
        id: clientId,
        socket: ws,
        subscriptions: new Set(),
        authenticated: false,
        lastActivity: new Date()
      };

      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);

      ws.on('message', (message) => {
        this.handleMessage(clientId, message);
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'user_activity',
        data: { message: 'Connected to ASTRA Intelligence Stream' },
        timestamp: new Date(),
        channel: 'system'
      });
    });
  }

  private handleMessage(clientId: string, message: Buffer) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const data = JSON.parse(message.toString());
      client.lastActivity = new Date();

      switch (data.type) {
        case 'subscribe':
          this.handleSubscription(clientId, data.subscription);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, data.channel);
          break;
        case 'authenticate':
          this.handleAuthentication(clientId, data.token);
          break;
        case 'ping':
          this.sendToClient(clientId, {
            type: 'user_activity',
            data: { message: 'pong' },
            timestamp: new Date(),
            channel: 'system'
          });
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleSubscription(clientId: string, subscription: StreamSubscription) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.add(subscription.channel);
    
    if (!this.channels.has(subscription.channel)) {
      this.channels.set(subscription.channel, new Set());
    }
    this.channels.get(subscription.channel)!.add(clientId);

    this.sendToClient(clientId, {
      type: 'user_activity',
      data: { message: `Subscribed to ${subscription.channel}` },
      timestamp: new Date(),
      channel: 'system'
    });

    console.log(`Client ${clientId} subscribed to ${subscription.channel}`);
  }

  private handleUnsubscription(clientId: string, channel: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.delete(channel);
    this.channels.get(channel)?.delete(clientId);

    this.sendToClient(clientId, {
      type: 'user_activity',
      data: { message: `Unsubscribed from ${channel}` },
      timestamp: new Date(),
      channel: 'system'
    });
  }

  private handleAuthentication(clientId: string, token: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Simple token validation (in production, use proper JWT validation)
    if (token === 'demo_token' || token) {
      client.authenticated = true;
      this.sendToClient(clientId, {
        type: 'user_activity',
        data: { message: 'Authentication successful' },
        timestamp: new Date(),
        channel: 'system'
      });
    } else {
      this.sendToClient(clientId, {
        type: 'user_activity',
        data: { message: 'Authentication failed' },
        timestamp: new Date(),
        channel: 'system'
      });
    }
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove from all channels
      client.subscriptions.forEach(channel => {
        this.channels.get(channel)?.delete(clientId);
      });
      this.clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    }
  }

  private sendToClient(clientId: string, message: StreamMessage) {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  private broadcastToChannel(channel: string, message: StreamMessage) {
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.forEach(clientId => {
        this.sendToClient(clientId, message);
      });
    }
  }

  private startDataStreaming() {
    // Simulate real-time data streaming
    this.streamingInterval = setInterval(() => {
      this.generateStreamingData();
    }, 5000); // Update every 5 seconds
  }

  private generateStreamingData() {
    // Simulate various streaming data types
    const streamTypes = [
      {
        type: 'metric_update' as const,
        channel: 'metrics',
        data: {
          totalPosts: Math.floor(Math.random() * 1000) + 500,
          avgSentiment: (Math.random() - 0.5) * 2,
          engagement: Math.floor(Math.random() * 50000) + 10000,
          timestamp: new Date()
        }
      },
      {
        type: 'sentiment_change' as const,
        channel: 'sentiment',
        data: {
          postId: Math.floor(Math.random() * 100) + 1,
          oldSentiment: Math.random() - 0.5,
          newSentiment: Math.random() - 0.5,
          change: Math.random() * 0.4 - 0.2,
          timestamp: new Date()
        }
      },
      {
        type: 'ai_insight' as const,
        channel: 'insights',
        data: {
          type: 'trend_detection',
          title: 'New Narrative Trend Detected',
          description: 'Rising discussion about economic policies',
          confidence: Math.floor(Math.random() * 30) + 70,
          impact: 'medium',
          timestamp: new Date()
        }
      },
      {
        type: 'post_update' as const,
        channel: 'posts',
        data: {
          postId: Math.floor(Math.random() * 100) + 1,
          newLikes: Math.floor(Math.random() * 1000) + 100,
          newComments: Math.floor(Math.random() * 50) + 5,
          engagementRate: Math.random() * 0.1 + 0.02,
          timestamp: new Date()
        }
      }
    ];

    // Randomly select and broadcast streaming data
    const selectedStream = streamTypes[Math.floor(Math.random() * streamTypes.length)];
    this.broadcastToChannel(selectedStream.channel, {
      type: selectedStream.type,
      data: selectedStream.data,
      timestamp: new Date(),
      channel: selectedStream.channel
    });
  }

  public broadcastMetricUpdate(data: any) {
    this.broadcastToChannel('metrics', {
      type: 'metric_update',
      data,
      timestamp: new Date(),
      channel: 'metrics'
    });
  }

  public broadcastAIInsight(data: any) {
    this.broadcastToChannel('insights', {
      type: 'ai_insight',
      data,
      timestamp: new Date(),
      channel: 'insights'
    });
  }

  public getActiveConnections(): number {
    return this.clients.size;
  }

  public getChannelSubscriptions(): Record<string, number> {
    const subscriptions: Record<string, number> = {};
    this.channels.forEach((clients, channel) => {
      subscriptions[channel] = clients.size;
    });
    return subscriptions;
  }

  public cleanup() {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
    }
    this.wss.close();
  }
}