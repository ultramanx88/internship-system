'use client';

import { SupervisorGuard } from '@/components/auth/PermissionGuard';
import { SupervisorMenu } from '@/components/supervisor/SupervisorMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function SupervisorDashboard() {
  // Mock data - ในระบบจริงจะดึงจาก API
  const stats = {
    totalStudents: 12,
    pendingApplications: 3,
    completedSupervisions: 8,
    upcomingMeetings: 2,
    thisMonthSupervisions: 15,
    averageRating: 4.2
  };

  const recentActivities = [
    {
      id: 1,
      student: 'นาย สมชาย ใจดี',
      activity: 'ส่งเอกสารฝึกงาน',
      time: '2 ชั่วโมงที่แล้ว',
      status: 'pending'
    },
    {
      id: 2,
      student: 'นางสาว สุดา ใจงาม',
      activity: 'นัดหมายนิเทศ',
      time: '1 วันที่แล้ว',
      status: 'completed'
    },
    {
      id: 3,
      student: 'นาย วิชัย เก่งมาก',
      activity: 'อัปเดตความคืบหน้า',
      time: '3 วันที่แล้ว',
      status: 'completed'
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      student: 'นาย อนันต์ เรียนดี',
      date: '15 มกราคม 2567',
      time: '14:00 - 15:00',
      type: 'นิเทศออนไลน์'
    },
    {
      id: 2,
      student: 'นางสาว มาลี สวยงาม',
      date: '18 มกราคม 2567',
      time: '10:00 - 11:00',
      type: 'นิเทศที่บริษัท'
    }
  ];

  return (
    <SupervisorGuard>
      <div className="flex h-screen bg-gray-50">
        <SupervisorMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">แดชบอร์ดอาจารย์นิเทศ</h1>
            <p className="text-gray-600">ภาพรวมการนิเทศนักศึกษาฝึกงานและสหกิจศึกษา</p>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">นักศึกษารวม</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 จากเดือนที่แล้ว
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">รอตรวจเอกสาร</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      ต้องตรวจสอบ
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">นิเทศเสร็จสิ้น</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.completedSupervisions}</div>
                    <p className="text-xs text-muted-foreground">
                      ในภาคเรียนนี้
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">นัดหมายใกล้ๆ</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.upcomingMeetings}</div>
                    <p className="text-xs text-muted-foreground">
                      ภายใน 7 วัน
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      กิจกรรมล่าสุด
                    </CardTitle>
                    <CardDescription>
                      กิจกรรมของนักศึกษาที่รับผิดชอบ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="font-medium text-sm">{activity.student}</p>
                              <p className="text-xs text-gray-600">{activity.activity}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      ดูทั้งหมด
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Meetings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      นัดหมายนิเทศ
                    </CardTitle>
                    <CardDescription>
                      นัดหมายที่กำลังจะมาถึง
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="p-3 border rounded-lg bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{meeting.student}</p>
                              <p className="text-xs text-gray-600">{meeting.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{meeting.date}</p>
                              <p className="text-xs text-gray-600">{meeting.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      ดูตารางนัดหมาย
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>การดำเนินการด่วน</CardTitle>
                  <CardDescription>
                    ฟังก์ชันที่ใช้บ่อยสำหรับอาจารย์นิเทศ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span>ตรวจเอกสาร</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>จัดการนักศึกษา</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Calendar className="h-6 w-6" />
                      <span>นัดหมายนิเทศ</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SupervisorGuard>
  );
}
