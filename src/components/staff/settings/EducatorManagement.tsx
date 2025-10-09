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

interface Course {
  id: string;
  code: string;
  name: string;
}

interface CourseInstructor {
  id: string;
  courseId: string;
  userId: string;
  role: string;
  isActive: boolean;
  course: Course;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function EducatorManagement() {
  const [educatorRoles, setEducatorRoles] = useState<EducatorRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
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
      const [rolesResponse, usersResponse, coursesResponse, instructorsResponse] = await Promise.all([
        fetch('/api/educator-roles'),
        fetch('/api/users?role=instructor'),
        fetch('/api/courses'),
        fetch('/api/course-instructors')
      ]);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setEducatorRoles(rolesData);
        console.log('Loaded educator roles:', rolesData.length);
      } else {
        console.error('Failed to load educator roles:', rolesResponse.status);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
        console.log('Loaded users:', usersData.length);
      } else {
        console.error('Failed to load users:', usersResponse.status);
      }

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
        console.log('Loaded courses:', coursesData.length);
      } else {
        console.error('Failed to load courses:', coursesResponse.status);
      }

      if (instructorsResponse.ok) {
        const instructorsData = await instructorsResponse.json();
        setCourseInstructors(instructorsData);
        console.log('Loaded course instructors:', instructorsData.length);
      } else {
        console.error('Failed to load course instructors:', instructorsResponse.status);
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
        courseId: '',
        userId: '',
        role: 'instructor',
        isActive: true,
        course: { id: '', code: '', name: '' },
        user: { id: '', name: '', email: '' }
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
    setCourseInstructors(prev => prev.map(instructor => {
      if (instructor.id === id) {
        if (field === 'courseId') {
          const selectedCourse = courses.find(c => c.id === value);
          return {
            ...instructor,
            courseId: value as string,
            course: selectedCourse || instructor.course
          };
        } else {
          return { ...instructor, [field]: value };
        }
      }
      return instructor;
    }));
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
                    <TableHead>รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead>อาจารย์</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell>
                        <Select
                          value={instructor.courseId}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'courseId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวิชา" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses && courses.length > 0 ? courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.code} - {course.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="" disabled>
                                ไม่พบวิชา
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {instructor.course?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={instructor.userId}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'userId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกอาจารย์" />
                          </SelectTrigger>
                          <SelectContent>
                            {users && users.length > 0 ? users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="" disabled>
                                ไม่พบผู้ใช้
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={instructor.role}
                          onValueChange={(value) => handleInstructorChange(instructor.id, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกบทบาท" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instructor">อาจารย์ประจำวิชา</SelectItem>
                            <SelectItem value="assistant">ผู้ช่วยสอน</SelectItem>
                            <SelectItem value="coordinator">ผู้ประสานงาน</SelectItem>
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
