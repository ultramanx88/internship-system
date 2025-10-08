'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogViewer } from '@/components/admin/logs/LogViewer';
import { PDPAManagement } from '@/components/admin/pdpa/PDPAManagement';
import { BackupManagement } from '@/components/admin/backup/BackupManagement';
import { AdminGuard } from '@/components/auth/PermissionGuard';
import { 
  Database, 
  Shield, 
  FileText, 
  Settings,
  BarChart3,
  Clock,
  HardDrive
} from 'lucide-react';

export default function SystemManagementPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">การจัดการระบบ</h1>
          <p className="text-muted-foreground">
            จัดการระบบ Log, PDPA, และ Backup สำหรับระบบฝึกงานและสหกิจศึกษา
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ระบบ Log</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90 วัน</div>
              <p className="text-xs text-muted-foreground">
                เก็บ Log อัตโนมัติ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDPA</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">เปิดใช้งาน</div>
              <p className="text-xs text-muted-foreground">
                ปกป้องข้อมูลส่วนบุคคล
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backup</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">อัตโนมัติ</div>
              <p className="text-xs text-muted-foreground">
                สำรองข้อมูลทุกวัน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การย้ายข้อมูล</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">พร้อมใช้งาน</div>
              <p className="text-xs text-muted-foreground">
                Migrate & Restore
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              ระบบ Log
            </TabsTrigger>
            <TabsTrigger value="pdpa" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              PDPA
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup & Restore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <LogViewer />
          </TabsContent>

          <TabsContent value="pdpa" className="space-y-4">
            <PDPAManagement />
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <BackupManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
