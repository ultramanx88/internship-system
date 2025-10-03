'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeCRUD() {
  const { socket, isConnected } = useRealtime();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Create User with Realtime
  const createUser = useCallback(async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'สำเร็จ',
          description: result.message,
        });
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถสร้างผู้ใช้ได้',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update User with Realtime
  const updateUser = useCallback(async (userId: string, userData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/realtime?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'สำเร็จ',
          description: result.message,
        });
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถอัปเดตผู้ใช้ได้',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Delete User with Realtime
  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/realtime?id=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'สำเร็จ',
          description: result.message,
        });
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถลบผู้ใช้ได้',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Listen for realtime updates
  useEffect(() => {
    if (!socket) return;

    const handleUserCreated = (data: any) => {
      console.log('🆕 User created:', data);
      // Trigger custom event for components to listen
      window.dispatchEvent(new CustomEvent('realtime-user-created', { detail: data }));
    };

    const handleUserUpdated = (data: any) => {
      console.log('✏️ User updated:', data);
      window.dispatchEvent(new CustomEvent('realtime-user-updated', { detail: data }));
    };

    const handleUserDeleted = (data: any) => {
      console.log('🗑️ User deleted:', data);
      window.dispatchEvent(new CustomEvent('realtime-user-deleted', { detail: data }));
    };

    socket.on('user-created', handleUserCreated);
    socket.on('user-updated', handleUserUpdated);
    socket.on('user-deleted', handleUserDeleted);

    return () => {
      socket.off('user-created', handleUserCreated);
      socket.off('user-updated', handleUserUpdated);
      socket.off('user-deleted', handleUserDeleted);
    };
  }, [socket]);

  return {
    createUser,
    updateUser,
    deleteUser,
    isLoading,
    isConnected,
  };
}

// Hook for listening to realtime data changes
export function useRealtimeData<T>(eventName: string, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const handleCreate = (event: CustomEvent) => {
      const newItem = event.detail.data;
      setData(prev => [...prev, newItem]);
      setLastUpdate(new Date());
    };

    const handleUpdate = (event: CustomEvent) => {
      const updatedItem = event.detail.data;
      setData(prev => prev.map(item => 
        (item as any).id === updatedItem.id ? updatedItem : item
      ));
      setLastUpdate(new Date());
    };

    const handleDelete = (event: CustomEvent) => {
      const deletedId = event.detail.data.id;
      setData(prev => prev.filter(item => (item as any).id !== deletedId));
      setLastUpdate(new Date());
    };

    window.addEventListener(`realtime-${eventName}-created`, handleCreate as EventListener);
    window.addEventListener(`realtime-${eventName}-updated`, handleUpdate as EventListener);
    window.addEventListener(`realtime-${eventName}-deleted`, handleDelete as EventListener);

    return () => {
      window.removeEventListener(`realtime-${eventName}-created`, handleCreate as EventListener);
      window.removeEventListener(`realtime-${eventName}-updated`, handleUpdate as EventListener);
      window.removeEventListener(`realtime-${eventName}-deleted`, handleDelete as EventListener);
    };
  }, [eventName]);

  return { data, setData, lastUpdate };
}