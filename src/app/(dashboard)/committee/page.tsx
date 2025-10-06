'use client';

import { CommitteeMenu } from '@/components/committee/CommitteeMenu';
import { CommitteeGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckSquare, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CommitteeDashboard() {
  return (
    <CommitteeGuard>
      <div className="flex h-screen bg-gray-100">
        <CommitteeMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดกรรมการ</h1>
            <p className="text-gray-600">ภาพรวมการทำงานของกรรมการสหกิจศึกษา</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* สถิติการทำงาน */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">คำขอรอการพิจารณา</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 จากสัปดาห์ที่แล้ว
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">การประเมินเสร็จสิ้น</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    +8 จากสัปดาห์ที่แล้ว
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    +12 จากเดือนที่แล้ว
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">อัตราการอนุมัติ</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% จากเดือนที่แล้ว
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* การดำเนินการล่าสุด */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>คำขอที่รอการพิจารณา</CardTitle>
                  <CardDescription>
                    รายการคำขอสหกิจศึกษาที่รอการพิจารณาจากกรรมการ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">นาย สมชาย ใจดี</p>
                        <p className="text-sm text-gray-600">บริษัท ABC จำกัด</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/committee/applications">ดูรายละเอียด</Link>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">นางสาว สุดา ใจงาม</p>
                        <p className="text-sm text-gray-600">บริษัท XYZ จำกัด</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/committee/applications">ดูรายละเอียด</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>การประเมินล่าสุด</CardTitle>
                  <CardDescription>
                    การประเมินที่กรรมการได้ดำเนินการล่าสุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">นาย วิชัย เก่งมาก</p>
                        <p className="text-sm text-gray-600">บริษัท DEF จำกัด - ผ่าน</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">เสร็จสิ้น</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">นางสาว มาลี สวยงาม</p>
                        <p className="text-sm text-gray-600">บริษัท GHI จำกัด - ผ่าน</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">เสร็จสิ้น</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CommitteeGuard>
  );
}
