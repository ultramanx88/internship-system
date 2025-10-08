'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, Download, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface LogEntry {
  id: string;
  level: string;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface LogFilters {
  type: 'system' | 'audit';
  level?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    type: 'system',
    limit: 100,
    offset: 0,
  });

  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs', { method: 'DELETE' });
      if (response.ok) {
        await fetchLogs();
        alert('Logs cleaned up successfully');
      }
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
      alert('Failed to cleanup logs');
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      params.append('limit', '10000'); // Export more logs

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data.logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${filters.type}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'destructive';
      case 'WARN': return 'secondary';
      case 'INFO': return 'default';
      case 'DEBUG': return 'outline';
      default: return 'default';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ตัวกรอง Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">ประเภท Log</label>
              <Select
                value={filters.type}
                onValueChange={(value: 'system' | 'audit') => 
                  setFilters(prev => ({ ...prev, type: value, offset: 0 }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Logs</SelectItem>
                  <SelectItem value="audit">Audit Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ระดับ</label>
              <Select
                value={filters.level || ''}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, level: value || undefined, offset: 0 }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="กรองตาม User ID"
                value={filters.userId || ''}
                onChange={(e) => 
                  setFilters(prev => ({ ...prev, userId: e.target.value || undefined, offset: 0 }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">จำนวนต่อหน้า</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, limit: parseInt(value), offset: 0 }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={cleanupLogs} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              ลบ Logs เก่า
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Logs ({total} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">กำลังโหลด...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">ไม่พบ Logs</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getLevelColor(log.level) as any}>
                          {log.level}
                        </Badge>
                        {log.method && (
                          <span className={`px-2 py-1 rounded text-xs font-mono ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                        )}
                        {log.statusCode && (
                          <Badge variant={log.statusCode >= 400 ? 'destructive' : 'default'}>
                            {log.statusCode}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{log.message}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        {log.user && (
                          <div>ผู้ใช้: {log.user.name} ({log.user.email})</div>
                        )}
                        {log.endpoint && (
                          <div>Endpoint: {log.endpoint}</div>
                        )}
                        {log.ipAddress && (
                          <div>IP: {log.ipAddress}</div>
                        )}
                        {log.duration && (
                          <div>ระยะเวลา: {log.duration}ms</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {total > filters.limit && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={filters.offset === 0}
                onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="outline"
                disabled={filters.offset + filters.limit >= total}
                onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              >
                ถัดไป
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียด Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ข้อความ:</label>
                <p className="text-sm bg-gray-100 p-2 rounded">{selectedLog.message}</p>
              </div>
              
              {selectedLog.context && (
                <div>
                  <label className="text-sm font-medium">Context:</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Level:</label>
                  <p>{selectedLog.level}</p>
                </div>
                <div>
                  <label className="font-medium">วันที่:</label>
                  <p>{format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}</p>
                </div>
                {selectedLog.user && (
                  <>
                    <div>
                      <label className="font-medium">ผู้ใช้:</label>
                      <p>{selectedLog.user.name}</p>
                    </div>
                    <div>
                      <label className="font-medium">Email:</label>
                      <p>{selectedLog.user.email}</p>
                    </div>
                  </>
                )}
                {selectedLog.endpoint && (
                  <div>
                    <label className="font-medium">Endpoint:</label>
                    <p>{selectedLog.endpoint}</p>
                  </div>
                )}
                {selectedLog.method && (
                  <div>
                    <label className="font-medium">Method:</label>
                    <p>{selectedLog.method}</p>
                  </div>
                )}
                {selectedLog.statusCode && (
                  <div>
                    <label className="font-medium">Status Code:</label>
                    <p>{selectedLog.statusCode}</p>
                  </div>
                )}
                {selectedLog.duration && (
                  <div>
                    <label className="font-medium">ระยะเวลา:</label>
                    <p>{selectedLog.duration}ms</p>
                  </div>
                )}
                {selectedLog.ipAddress && (
                  <div>
                    <label className="font-medium">IP Address:</label>
                    <p>{selectedLog.ipAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
