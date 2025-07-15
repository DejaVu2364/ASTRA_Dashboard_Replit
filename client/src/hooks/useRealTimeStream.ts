import { useState, useEffect, useCallback, useRef } from 'react';

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

export interface StreamState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: StreamMessage | null;
  messageHistory: StreamMessage[];
  activeSubscriptions: Set<string>;
}

export function useRealTimeStream() {
  const [state, setState] = useState<StreamState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
    messageHistory: [],
    activeSubscriptions: new Set()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));

        // Send authentication
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: localStorage.getItem('astra_token') || 'demo_token'
        }));

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        console.log('Connected to ASTRA Intelligence Stream');
      };

      ws.onmessage = (event) => {
        try {
          const message: StreamMessage = JSON.parse(event.data);
          
          setState(prev => ({
            ...prev,
            lastMessage: message,
            messageHistory: [...prev.messageHistory.slice(-99), message] // Keep last 100 messages
          }));

        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: `Connection closed: ${event.reason || 'Unknown reason'}`
        }));

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);

        console.log('Disconnected from ASTRA Intelligence Stream');
      };

      ws.onerror = (error) => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: 'WebSocket connection error'
        }));
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: 'Failed to create WebSocket connection'
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({
      ...prev,
      connected: false,
      connecting: false,
      activeSubscriptions: new Set()
    }));
  }, []);

  const subscribe = useCallback((subscription: StreamSubscription) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        subscription
      }));

      setState(prev => ({
        ...prev,
        activeSubscriptions: new Set([...prev.activeSubscriptions, subscription.channel])
      }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }));

      setState(prev => {
        const newSubscriptions = new Set(prev.activeSubscriptions);
        newSubscriptions.delete(channel);
        return {
          ...prev,
          activeSubscriptions: newSubscriptions
        };
      });
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage
  };
}

// Hook for specific channel subscriptions
export function useChannelStream(channel: string, filters?: StreamSubscription['filters']) {
  const stream = useRealTimeStream();
  const [channelData, setChannelData] = useState<any>(null);
  const [channelHistory, setChannelHistory] = useState<StreamMessage[]>([]);

  useEffect(() => {
    if (stream.connected && !stream.activeSubscriptions.has(channel)) {
      stream.subscribe({ channel, filters });
    }

    return () => {
      if (stream.activeSubscriptions.has(channel)) {
        stream.unsubscribe(channel);
      }
    };
  }, [stream, channel, filters]);

  useEffect(() => {
    if (stream.lastMessage && stream.lastMessage.channel === channel) {
      setChannelData(stream.lastMessage.data);
      setChannelHistory(prev => [...prev.slice(-49), stream.lastMessage!]);
    }
  }, [stream.lastMessage, channel]);

  return {
    data: channelData,
    history: channelHistory,
    connected: stream.connected,
    error: stream.error
  };
}