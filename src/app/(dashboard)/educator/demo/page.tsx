'use client';

import { useState } from 'react';
import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EducatorDemoPage() {
  const [selectedRole, setSelectedRole] = useState<string>('instructor');
  const [selectedEducatorRole, setSelectedEducatorRole] = useState<string>('อาจารย์ประจำวิชา');

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'student', label: 'Student' }
  ];

  const educatorRoles = [
    { value: 'อาจารย์ประจำวิชา', label: 'อาจารย์ประจำวิชา' },
    { value: 'อาจารย์นิเทศ', label: 'อาจารย์นิเทศ' },
    { value: 'กรรมการ', label: 'กรรมการ' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Menu Sidebar */}
      <EducatorMenu 
        userRole={selectedRole} 
        educatorRole={selectedEducatorRole}
        className="flex-shrink-0"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ระบบเมนูแบบ Dynamic สำหรับบุคลากรทางการศึกษา
              </h1>
              <p className="text-gray-600 mt-2">
                ทดสอบการแสดงเมนูตาม role และ educator role
              </p>
            </div>

            {/* Role Selector */}
            <Card>
              <CardHeader>
                <CardTitle>เลือก Role เพื่อทดสอบ</CardTitle>
                <CardDescription>
                  เลือก role และ educator role เพื่อดูการเปลี่ยนแปลงของเมนู
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">User Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก User Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Educator Role</label>
                    <Select value={selectedEducatorRole} onValueChange={setSelectedEducatorRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Educator Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {educatorRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    User Role: {selectedRole}
                  </Badge>
                  <Badge variant="outline">
                    Educator Role: {selectedEducatorRole}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Role Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">อาจารย์ประจำวิชา</CardTitle>
                  <CardDescription>
                    เมนูสำหรับอาจารย์ประจำวิชา
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• รายการขอสหกิจศึกษา / ฝึกงาน</li>
                    <li>• มอบหมายอาจารย์นิเทศ</li>
                    <li>• รายงานผลการนิเทศ</li>
                    <li>• รายงานสรุปผลรวม</li>
                    <li>• บันทึกเกรด</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">อาจารย์นิเทศ</CardTitle>
                  <CardDescription>
                    เมนูสำหรับอาจารย์นิเทศ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• หนังสือขอฝึกงาน</li>
                    <li>• นัดหมายนิเทศ</li>
                    <li>• รายงานผลการนิเทศ</li>
                    <li>• บันทึกชั่วโมง</li>
                    <li>• โปรเจกต์ของนักศึกษา</li>
                    <li>• ประเมิน</li>
                    <li>• รายงานสรุปผลรวม</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">กรรมการ</CardTitle>
                  <CardDescription>
                    เมนูสำหรับกรรมการ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• ประเมินผลงาน</li>
                    <li>• รายงานกรรมการ</li>
                    <li>• การประชุมกรรมการ</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>คำแนะนำการใช้งาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>1. เลือก User Role:</strong> เลือก role หลักของผู้ใช้ (admin, staff, instructor, student)
                </p>
                <p className="text-sm">
                  <strong>2. เลือก Educator Role:</strong> เลือก role ย่อยของบุคลากรทางการศึกษา
                </p>
                <p className="text-sm">
                  <strong>3. ดูเมนู:</strong> เมนูด้านซ้ายจะเปลี่ยนตาม role ที่เลือก
                </p>
                <p className="text-sm">
                  <strong>4. Admin/Staff:</strong> จะเห็นเมนูทั้งหมด
                </p>
                <p className="text-sm">
                  <strong>5. Instructor:</strong> จะเห็นเมนูตาม educator role ที่เลือก
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
