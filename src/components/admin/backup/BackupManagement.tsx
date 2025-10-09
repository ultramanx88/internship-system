'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  HardDrive,
  FileText,
  Image
} from 'lucide-react';

interface BackupRecord {
  id: string;
  filename: string;
  filePath: string;
  fileSize: bigint;
  backupType: string;
  status: string;
  errorMessage?: string;
  metadata?: any;
  createdBy?: string;
  createdAt: string;
  completedAt?: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export function BackupManagement() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);

  // Create backup form
  const [createForm, setCreateForm] = useState({
    type: 'FULL',
    includeMedia: false,
    includeLogs: false,
    description: '',
  });

  // Restore form
  const [restoreForm, setRestoreForm] = useState({
    includeMedia: false,
    includeLogs: false,
    restoreTo: 'local',
  });

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/backup');
      const data = await response.json();
      
      // Check if response is an array, if not set empty array
      if (Array.isArray(data)) {
        setBackups(data);
      } else {
        console.error('API response is not an array:', data);
        setBackups([]);
        if (data.error) {
          alert(`เกิดข้อผิดพลาด: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      setBackups([]);
      alert('ไม่สามารถโหลดข้อมูล Backup ได้');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        setCreateForm({ type: 'FULL', includeMedia: false, includeLogs: false, description: '' });
        await fetchBackups();
        alert('สร้าง Backup สำเร็จ');
      } else {
        alert('สร้าง Backup ไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('สร้าง Backup ไม่สำเร็จ');
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: selectedBackup.id,
          ...restoreForm,
        }),
      });

      if (response.ok) {
        setRestoreDialogOpen(false);
        setSelectedBackup(null);
        alert('Restore สำเร็จ');
      } else {
        alert('Restore ไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Restore ไม่สำเร็จ');
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBackups();
        alert('ลบ Backup สำเร็จ');
      } else {
        alert('ลบ Backup ไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('ลบ Backup ไม่สำเร็จ');
    }
  };

  const downloadBackup = (backup: BackupRecord) => {
    // In a real implementation, this would download the backup file
    alert(`ดาวน์โหลด ${backup.filename}`);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL': return 'เต็ม';
      case 'INCREMENTAL': return 'เพิ่มเติม';
      case 'SCHEMA_ONLY': return 'โครงสร้างเท่านั้น';
      case 'DATA_ONLY': return 'ข้อมูลเท่านั้น';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'FAILED': return 'destructive';
      case 'IN_PROGRESS': return 'secondary';
      default: return 'outline';
    }
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            การจัดการ Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  สร้าง Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้าง Backup ใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">ประเภท Backup</Label>
                    <Select
                      value={createForm.type}
                      onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL">เต็ม (ข้อมูล + โครงสร้าง)</SelectItem>
                        <SelectItem value="DATA_ONLY">ข้อมูลเท่านั้น</SelectItem>
                        <SelectItem value="SCHEMA_ONLY">โครงสร้างเท่านั้น</SelectItem>
                        <SelectItem value="INCREMENTAL">เพิ่มเติม</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeMedia"
                        checked={createForm.includeMedia}
                        onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, includeMedia: !!checked }))}
                      />
                      <Label htmlFor="includeMedia" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        รวมไฟล์สื่อ
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeLogs"
                        checked={createForm.includeLogs}
                        onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, includeLogs: !!checked }))}
                      />
                      <Label htmlFor="includeLogs" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        รวม Logs
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
                    <Input
                      id="description"
                      placeholder="เช่น Backup ก่อนอัปเดตระบบ"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <Button onClick={createBackup} className="w-full">
                    สร้าง Backup
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={fetchBackups} disabled={loading}>
              <Database className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อไฟล์</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ขนาด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead>สร้างโดย</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    กำลังโหลด...
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(backups) || backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    {!Array.isArray(backups) ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล' : 'ไม่พบ Backup'}
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-mono text-sm">
                      {backup.filename}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getBackupTypeLabel(backup.backupType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatFileSize(backup.fileSize)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(backup.status)}
                        <Badge variant={getStatusColor(backup.status) as any}>
                          {backup.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(backup.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {backup.createdByUser?.name || 'ระบบ'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadBackup(backup)}
                          disabled={backup.status !== 'COMPLETED'}
                        >
                          <Download className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setRestoreDialogOpen(true);
                          }}
                          disabled={backup.status !== 'COMPLETED'}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ที่จะลบ Backup นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteBackup(backup.id)}>
                                ลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore จาก Backup</DialogTitle>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">ข้อมูล Backup</h4>
                <div className="text-sm space-y-1">
                  <p><strong>ไฟล์:</strong> {selectedBackup.filename}</p>
                  <p><strong>ประเภท:</strong> {getBackupTypeLabel(selectedBackup.backupType)}</p>
                  <p><strong>ขนาด:</strong> {formatFileSize(selectedBackup.fileSize)}</p>
                  <p><strong>วันที่:</strong> {new Date(selectedBackup.createdAt).toLocaleString('th-TH')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restoreMedia"
                    checked={restoreForm.includeMedia}
                    onCheckedChange={(checked) => setRestoreForm(prev => ({ ...prev, includeMedia: !!checked }))}
                  />
                  <Label htmlFor="restoreMedia" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Restore ไฟล์สื่อ
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restoreLogs"
                    checked={restoreForm.includeLogs}
                    onCheckedChange={(checked) => setRestoreForm(prev => ({ ...prev, includeLogs: !!checked }))}
                  />
                  <Label htmlFor="restoreLogs" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Restore Logs
                  </Label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">คำเตือน</p>
                    <p className="text-yellow-700">
                      การ Restore จะลบข้อมูลปัจจุบันทั้งหมดและแทนที่ด้วยข้อมูลจาก Backup นี้
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={restoreBackup} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
