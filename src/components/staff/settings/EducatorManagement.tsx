'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Save, Trash2, Loader2, Users, GraduationCap, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EducatorRole {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  educatorRoleId?: string;
  educatorRole?: EducatorRole;
}

interface CourseInstructor {
  id: string;
  academicYearId: string;
  semesterId: string;
  courseId?: string;
  instructorId: string;
  roleId: string;
  isActive: boolean;
  instructor: User;
  role: EducatorRole;
  academicYear: { year: string };
  semester: { name: string };
}

export function EducatorManagement() {
  const [educatorRoles, setEducatorRoles] = useState<EducatorRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courseInstructors, setCourseInstructors] = useState<CourseInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEducatorData();
  }, []);

  const loadEducatorData = async () => {
    setIsLoading(true);
    try {
      const [rolesResponse, usersResponse, instructorsResponse] = await Promise.all([
        fetch('/api/educator-roles'),
        fetch('/api/users?role=instructor'),
        fetch('/api/course-instructors')
      ]);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setEducatorRoles(rolesData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (instructorsResponse.ok) {
        const instructorsData = await instructorsResponse.json();
        setCourseInstructors(instructorsData);
      }
    } catch (error) {
      console.error('Error loading educator data:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลบุคลากรได้'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEducatorRole = () => {
    setEducatorRoles([
      ...educatorRoles,
      {
        id: `new-${Date.now()}`,
        name: '',
        nameEn: '',
        description: '',
        isActive: true
      }
    ]);
  };

  const handleAddCourseInstructor = () => {
    setCourseInstructors([
      ...courseInstructors,
      {
        id: `new-${Date.now()}`,
        academicYearId: '',
        semesterId: '',
        courseId: '',
        instructorId: '',
        roleId: '',
        isActive: true,
        instructor: { id: '', name: '', email: '', roles: '' },
        role: { id: '', name: '', nameEn: '', description: '', isActive: true },
        academicYear: { year: '' },
        semester: { name: '' }
      }
    ]);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/educator-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educatorRoles, courseInstructors })
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลบุคลากรได้รับการอัปเดตเรียบร้อยแล้ว'
      });

      loadEducatorData();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = (id: string, field: keyof EducatorRole, value: string | boolean) => {
    setEducatorRoles(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const handleInstructorChange = (id: string, field: string, value: string | boolean) => {
    setCourseInstructors(prev => prev.map(instructor => 
      instructor.id === id ? { ...instructor, [field]: value } : instructor
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการบุคลากรทางการศึกษา</CardTitle>
        <CardDescription>
          จัดการบทบาทบุคลากรและการกำหนดอาจารย์ประจำวิชา
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              บทบาทบุคลากร
            </TabsTrigger>
            <TabsTrigger value="instructors" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              กำหนดอาจารย์ประจำวิชา
            </TabsTrigger>
          </TabsList>

          {/* Educator Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">บทบาทบุคลากรทางการศึกษา</h3>
              <Button variant="outline" size="sm" onClick={handleAddEducatorRole}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มบทบาท
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อบทบาท (ไทย)</TableHead>
                    <TableHead>ชื่อบทบาท (อังกฤษ)</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {educatorRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Input
                          value={role.name}
                          onChange={(e) => handleRoleChange(role.id, 'name', e.target.value)}
                          placeholder="เช่น อาจารย์ประจำวิชา"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={role.nameEn}
                          onChange={(e) => handleRoleChange(role.id, 'nameEn', e.target.value)}
                          placeholder="e.g. Course Instructor"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={role.description}
                          onChange={(e) => handleRoleChange(role.id, 'description', e.target.value)}
                          placeholder="คำอธิบายบทบาท"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={role.isActive ? 'active' : 'inactive'}
                          onValueChange={(value) => handleRoleChange(role.id, 'isActive', value === 'active')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">ใช้งาน</SelectItem>
                            <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Course Instructors Tab */}
          <TabsContent value="instructors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">กำหนดอาจารย์ประจำวิชา</h3>
              <Button variant="outline" size="sm" onClick={handleAddCourseInstructor}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มการกำหนด
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ปีการศึกษา</TableHead>
                    <TableHead>ภาคเรียน</TableHead>
                    <TableHead>รหัสวิชา</TableHead>
                    <TableHead>อาจารย์</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell>{instructor.academicYear.year}</TableCell>
                      <TableCell>{instructor.semester.name}</TableCell>
                      <TableCell>
                        <Input
                          value={instructor.courseId || ''}
                          onChange={(e) => handleInstructorChange(instructor.id, 'courseId', e.target.value)}
                          placeholder="เช่น CS101"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={instructor.instructorId}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'instructorId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกอาจารย์" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={instructor.roleId}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'roleId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกบทบาท" />
                          </SelectTrigger>
                          <SelectContent>
                            {educatorRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={instructor.isActive ? 'active' : 'inactive'}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'isActive', value === 'active')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">ใช้งาน</SelectItem>
                            <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
