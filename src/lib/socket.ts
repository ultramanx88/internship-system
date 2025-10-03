import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: ServerIO;

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const initSocket = (server: NetServer) => {
  if (!io) {
    console.log('🔌 Initializing Socket.io server...');
    io = new ServerIO(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('👤 Client connected:', socket.id);

      // Join user to their own room for personal notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      });

      // Join admin room for admin notifications
      socket.on('join-admin-room', () => {
        socket.join('admin-room');
        console.log('👑 Admin joined admin room');
      });

      socket.on('disconnect', () => {
        console.log('👋 Client disconnected:', socket.id);
      });
    });
  }
  return io;
};