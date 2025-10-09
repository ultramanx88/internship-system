'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '@/hooks/use-auth-provider';
import { useToast } from '@/hooks/use-toast';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitUserUpdate: (data: any) => void;
  emitApplicationUpdate: (data: any) => void;
  emitDocumentUpdate: (data: any) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { toast } = useToast();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL || '' 
      : window.location.origin, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to Socket.io server');
      setIsConnected(true);
      
      // Join user-specific room
      if (user?.id) {
        socketInstance.emit('join-user-room', user.id);
        
        // Join admin room if user is admin
        if (user.roles.includes('admin')) {
          socketInstance.emit('join-admin-room');
        }
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.io server');
      setIsConnected(false);
    });

    // Listen for realtime updates
    socketInstance.on('user-updated', (data) => {
      console.log('👤 User updated:', data);
      toast({
        title: 'ข้อมูลผู้ใช้อัปเดต',
        description: `ข้อมูลของ ${data.name} ได้รับการอัปเดตแล้ว`,
      });
      // Trigger page refresh or state update
      window.dispatchEvent(new CustomEvent('user-updated', { detail: data }));
    });

    socketInstance.on('application-updated', (data) => {
      console.log('📝 Application updated:', data);
      toast({
        title: 'ใบสมัครอัปเดต',
        description: `ใบสมัครของ ${data.studentName} ได้รับการอัปเดตแล้ว`,
      });
      window.dispatchEvent(new CustomEvent('application-updated', { detail: data }));
    });

    socketInstance.on('document-updated', (data) => {
      console.log('📄 Document updated:', data);
      toast({
        title: 'เอกสารอัปเดต',
        description: `เอกสาร ${data.name} ได้รับการอัปเดตแล้ว`,
      });
      window.dispatchEvent(new CustomEvent('document-updated', { detail: data }));
    });

    socketInstance.on('new-application', (data) => {
      console.log('🆕 New application:', data);
      if (user?.roles.includes('admin') || user?.roles.includes('staff')) {
        toast({
          title: 'ใบสมัครใหม่',
          description: `${data.studentName} ได้ส่งใบสมัครใหม่`,
        });
        window.dispatchEvent(new CustomEvent('new-application', { detail: data }));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, toast]);

  const emitUserUpdate = (data: any) => {
    if (socket) {
      socket.emit('user-update', data);
    }
  };

  const emitApplicationUpdate = (data: any) => {
    if (socket) {
      socket.emit('application-update', data);
    }
  };

  const emitDocumentUpdate = (data: any) => {
    if (socket) {
      socket.emit('document-update', data);
    }
  };

  return (
    <RealtimeContext.Provider value={{
      socket,
      isConnected,
      emitUserUpdate,
      emitApplicationUpdate,
      emitDocumentUpdate,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}