'use client';

import Link from 'next/link';
import { StaffGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacultyManagement } from '@/components/admin/settings/FacultyManagement';
import { DepartmentManagement } from '@/components/admin/settings/DepartmentManagement';
import { CurriculumManagement } from '@/components/admin/settings/CurriculumManagement';
import { MajorManagement } from '@/components/admin/settings/MajorManagement';

export default function StaffAcademicManagementPage() {
  return (
    <StaffGuard>
      <div className="grid gap-8 text-secondary-600">
        <div>
          <div className="text-sm text-muted-foreground mb-2">
            <Link href="/staff" className="hover:underline">แดชบอร์ดเจ้าหน้าที่</Link>
            <span className="mx-2">/</span>
            <span>โครงสร้างวิชาการ</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">โครงสร้างวิชาการ</h1>
          <p>จัดการคณะ สาขา หลักสูตร และวิชาเอก</p>
          <p className="text-sm text-muted-foreground mt-1">สิทธิ์: เจ้าหน้าที่ (Staff) สามารถเพิ่ม แก้ไข และลบข้อมูลได้</p>
        </div>

        <Tabs defaultValue="faculties" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faculties">คณะ</TabsTrigger>
            <TabsTrigger value="departments">สาขา</TabsTrigger>
            <TabsTrigger value="curriculums">หลักสูตร</TabsTrigger>
            <TabsTrigger value="majors">วิชาเอก</TabsTrigger>
          </TabsList>

          <TabsContent value="faculties">
            <FacultyManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="curriculums">
            <CurriculumManagement />
          </TabsContent>

          <TabsContent value="majors">
            <MajorManagement />
          </TabsContent>
        </Tabs>
      </div>
    </StaffGuard>
  );
}


