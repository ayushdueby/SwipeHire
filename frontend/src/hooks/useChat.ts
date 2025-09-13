'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/lib/api';
import { analytics } from '@/lib/analytics';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  ts: string;
  sender?: {
    email: string;
  };
}

export interface TypingUser {
  userId: string;
  userEmail: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [sending, setSending] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { getToken } = useAuth();
  const api = useApi();

  // Initialize socket connection
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (!token || !mounted) return;

        const socket = io(WS_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (mounted) {
            setConnected(true);
            setError(null);
            console.log('Connected to chat server');
            
            // Join match room
            socket.emit('join:match', { matchId });
          }
        });

        socket.on('disconnect', (reason) => {
          if (mounted) {
            setConnected(false);
            console.log('Disconnected from chat server:', reason);
          }
        });

        socket.on('connect_error', (error) => {
          if (mounted) {
            setError(`Connection failed: ${error.message}`);
            console.error('Socket connection error:', error);
          }
        });

        socket.on('match:joined', (data) => {
          console.log('Joined match room:', data.matchId);
        });

        socket.on('message:new', (data) => {
          if (mounted && data.message) {
            setMessages(prev => [...prev, data.message]);
          }
        });

        socket.on('typing:start', (data) => {
          if (mounted) {
            setTypingUsers(prev => {
              const exists = prev.find(user => user.userId === data.userId);
              if (!exists) {
                return [...prev, { userId: data.userId, userEmail: data.userEmail }];
              }
              return prev;
            });
          }
        });

        socket.on('typing:stop', (data) => {
          if (mounted) {
            setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
          }
        });

        socket.on('error', (error) => {
          if (mounted) {
            setError(error.message || 'Socket error occurred');
            console.error('Socket error:', error);
          }
        });

      } catch (error) {
        if (mounted) {
          setError('Failed to initialize chat connection');
          console.error('Error initializing socket:', error);
        }
      }
    };

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [matchId, getToken]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/messages?matchId=${matchId}&limit=50`);
        setMessages(response.data.messages || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      loadMessages();
    }
  }, [matchId, api]);

  // Send message
  const sendMessage = useCallback(async (body: string) => {
    if (!body.trim() || !socketRef.current || sending) return;

    try {
      setSending(true);
      setError(null);

      // Send via socket for real-time delivery
      socketRef.current.emit('message:send', {
        matchId,
        body: body.trim(),
      });

      // Track analytics
      analytics.messageSent({
        length: body.length,
        matchId,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }, [matchId, sending]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing:start', { matchId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('typing:stop', { matchId });
        }
      }, 3000);
    }
  }, [matchId]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing:stop', { matchId });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [matchId]);

  return {
    messages,
    loading,
    error,
    connected,
    typingUsers,
    sending,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
