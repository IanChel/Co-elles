import { io } from 'socket.io-client';

// Même IP que le backend, mais sans /api
const SOCKET_URL = 'http://172.20.10.2:5000';

let socket = null;

export const connectSocket = () => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],  // Force WebSocket (plus rapide que le polling)
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket.io connecté:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.io déconnecté');
  });

  socket.on('connect_error', (error) => {
    console.log('⚠️ Erreur Socket.io:', error.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
