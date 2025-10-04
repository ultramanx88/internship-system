'use client';

import { useEducatorRole } from '@/hooks/useEducatorRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Clock, 
  BarChart3,
  Settings,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function EducatorDashboard() {
  const { user, educatorRole, isLoading, error, isAdmin, isInstructor, isAcademicAdvisor, isCommittee } = useEducatorRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-600">กรุณาเข้าสู่ระบบ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            สวัสดี, {user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {educatorRole ? educatorRole.name : 'บุคลากรทางการศึกษา'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {educatorRole && (
            <Badge variant="secondary" className="text-sm">
              {educatorRole.name}
            </Badge>
          )}
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              ตั้งค่า
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักศึกษาที่ดูแล</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายงานที่รอตรวจ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              ต้องตรวจสอบภายใน 3 วัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ชั่วโมงนิเทศ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              ชั่วโมงในเดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8</div>
            <p className="text-xs text-muted-foreground">
              คะแนนเฉลี่ยของนักศึกษา
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-based Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* อาจารย์ประจำวิชา */}
        {isInstructor() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                เมนู อาจารย์ประจำวิชา
              </CardTitle>
              <CardDescription>
                จัดการงานในฐานะอาจารย์ประจำวิชา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/educator/coop-requests">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  รายการขอสหกิจศึกษา / ฝึกงาน
                </Button>
              </Link>
              <Link href="/educator/assign-advisor">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  มอบหมายอาจารย์นิเทศ
                </Button>
              </Link>
              <Link href="/educator/record-grades">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  บันทึกเกรด
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* อาจารย์นิเทศ */}
        {isAcademicAdvisor() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                เมนู อาจารย์นิเทศ
              </CardTitle>
              <CardDescription>
                จัดการงานในฐานะอาจารย์นิเทศ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/educator/supervision-appointment">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  นัดหมายนิเทศ
                </Button>
              </Link>
              <Link href="/educator/student-projects">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  โปรเจกต์ของนักศึกษา
                </Button>
              </Link>
              <Link href="/educator/evaluate">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  ประเมิน
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* กรรมการ */}
        {isCommittee() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                เมนู กรรมการ
              </CardTitle>
              <CardDescription>
                จัดการงานในฐานะกรรมการ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/educator/committee-evaluation">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  ประเมินผลงาน
                </Button>
              </Link>
              <Link href="/educator/committee-meeting">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  การประชุมกรรมการ
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
          <CardDescription>
            กิจกรรมที่เกิดขึ้นล่าสุดในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">นักศึกษาใหม่สมัครฝึกงาน</p>
                <p className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">รายงานการนิเทศได้รับการอนุมัติ</p>
                <p className="text-xs text-gray-500">4 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">มีนัดหมายนิเทศใหม่</p>
                <p className="text-xs text-gray-500">1 วันที่แล้ว</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
