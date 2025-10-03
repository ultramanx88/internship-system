'use client';

import { useRealtime } from '@/contexts/RealtimeContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export function RealtimeStatus() {
  const { isConnected } = useRealtime();

  return (
    <Badge 
      variant={isConnected ? 'default' : 'destructive'}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          เชื่อมต่อแล้ว
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          ไม่ได้เชื่อมต่อ
        </>
      )}
    </Badge>
  );
}