import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

import { BASE_API_URL } from '../utils/apiRequestUrl';

const SOCKET_URL = BASE_API_URL.replace('/api/v1', '');

export function useSocket(onMessage, onUserStatusChange, onTyping) {
  const socketRef = useRef(null);
  const handlersRef = useRef({ onMessage, onUserStatusChange, onTyping });

  // Update handlers ref when props change without triggering reconnection
  useEffect(() => {
    handlersRef.current = { onMessage, onUserStatusChange, onTyping };
  }, [onMessage, onUserStatusChange, onTyping]);

  useEffect(() => {
    const token = localStorage.getItem('umi_auth_token');
    console.log('Initializing socket connection with token:', !!token);
    if (!token) return;

    // Connect with JWT
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Event handlers that use the latest callbacks
    const handleMessage = (data) => {
      console.log('Socket message received in useSocket:', data);
      if (handlersRef.current.onMessage) {
        handlersRef.current.onMessage(data);
      }
    };

    const handleUserStatusChange = (data) => {
      console.log('Socket user status change received:', data);
      if (handlersRef.current.onUserStatusChange) {
        handlersRef.current.onUserStatusChange(data);
      }
    };

    const handleTyping = (data) => {
      console.log('Socket typing event received:', data);
      if (handlersRef.current.onTyping) {
        handlersRef.current.onTyping(data);
      }
    };

    // Listen for various events
    socket.on('new_message', handleMessage);
    socket.on('message_read', handleMessage);
    socket.on('user_status_changed', handleUserStatusChange);
    socket.on('online_users_updated', handleUserStatusChange);
    socket.on('user_typing', handleTyping);
    socket.on('new_document_uploaded', handleMessage);

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socket.off('new_message', handleMessage);
      socket.off('message_read', handleMessage);
      socket.off('user_status_changed', handleUserStatusChange);
      socket.off('online_users_updated', handleUserStatusChange);
      socket.off('user_typing', handleTyping);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty dependency array to prevent reconnection loops

  // Helper functions to emit events
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_conversation', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_conversation', { conversationId });
    }
  }, []);

  const startTyping = useCallback((conversationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  }, []);

  const stopTyping = useCallback((conversationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping
  };
} 