'use client';

import { useState, useEffect } from 'react';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users, 
  FileText, 
  Clock, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Bell,
  GraduationCap,
  Building,
  UserCheck,
  BookOpen
} from 'lucide-react';

interface DashboardData {
  upcomingSchedule: any[];
  studentDocuments: any[];
  myTasks: any[];
  students: any[];
  coopSteps: any[];
  notifications: any[];
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export default function EducatorDashboardV2() {
  const { user, educatorRole, isLoading: roleLoading, error: roleError } = useEducatorRole();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !roleLoading) {
      loadDashboardData();
    }
  }, [user, roleLoading]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/educator/dashboard?userId=${user?.id}&role=${educatorRole?.name || ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (roleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (roleError || error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">เกิดข้อผิดพลาด: {roleError || error}</p>
        </div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-600">ไม่พบข้อมูลผู้ใช้</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'selecting': return 'text-pink-600 bg-pink-100';
      case 'scheduled': return 'text-green-600 bg-green-100';
      case 'not_scheduled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'เอกสารผ่านแล้ว';
      case 'pending': return 'รอการพิจารณา';
      case 'selecting': return 'กำลังเลือกบริษัท';
      case 'scheduled': return 'นัดหมายแล้ว';
      case 'not_scheduled': return 'ยังไม่นัดหมาย';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">หน้าแรก</h1>
          <p className="text-gray-600 mt-1">
            {dashboardData.user.role}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {dashboardData.user.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* กำหนดการใกล้ถึง */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                กำหนดการใกล้ถึง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.upcomingSchedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.date}</span>
                        <span className="text-gray-500 text-sm">{item.time}</span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">ผู้รับผิดชอบ: {item.handler}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* จำนวนนักศึกษาที่ส่งเอกสารฝึกงาน */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                จำนวนนักศึกษาที่ส่งเอกสารฝึกงาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Donut Chart */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={`${dashboardData.studentDocuments[0]?.percentage * 2.51} 251`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="8"
                      strokeDasharray={`${dashboardData.studentDocuments[1]?.percentage * 2.51} 251`}
                      strokeDashoffset={`-${dashboardData.studentDocuments[0]?.percentage * 2.51}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="8"
                      strokeDasharray={`${dashboardData.studentDocuments[2]?.percentage * 2.51} 251`}
                      strokeDashoffset={`-${(dashboardData.studentDocuments[0]?.percentage + dashboardData.studentDocuments[1]?.percentage) * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">100</div>
                      <div className="text-sm text-gray-500">นักศึกษา</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {dashboardData.studentDocuments.map((doc) => (
                  <div key={doc.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${doc.color}`}></div>
                      <span className="text-sm text-gray-600">{getStatusText(doc.status)}</span>
                    </div>
                    <span className="text-sm font-medium">{doc.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* งานของฉัน */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                งานของฉัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.myTasks.map((task) => (
                  <Button
                    key={task.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => window.location.href = task.href}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.count} คน</p>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === 'high' ? 'สูง' : task.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* รายชื่อ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                รายชื่อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">ชื่อนักศึกษา</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">รหัสประจำตัว</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">ชื่อบริษัท</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">ผู้ติดต่อ</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">อาจารย์นิเทศ</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">นัดหมาย</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">ข้อมูลเพิ่มเติม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 text-sm">{student.name}</td>
                        <td className="py-2 text-sm">{student.studentId}</td>
                        <td className="py-2 text-sm">{student.company}</td>
                        <td className="py-2 text-sm">{student.contactPerson}</td>
                        <td className="py-2 text-sm">{student.supervisor}</td>
                        <td className="py-2">
                          <Badge className={getStatusColor(student.appointmentStatus)}>
                            {getStatusText(student.appointmentStatus)}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* ขั้นตอนการยื่นสหกิจศึกษา */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                ขั้นตอนการยื่นสหกิจศึกษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.coopSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.dateRange}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* การแจ้งเตือน */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
