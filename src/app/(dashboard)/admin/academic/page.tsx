'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  GraduationCap, 
  Building, 
  BookOpen, 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Major {
  id: string;
  nameTh: string;
  nameEn?: string;
  area?: string;
}

interface Curriculum {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  degree?: string;
  majors: Major[];
}

interface Department {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  curriculums: Curriculum[];
  _count: {
    curriculums?: number;
    users?: number;
  };
}

interface Faculty {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  departments: Department[];
  _count: {
    departments?: number;
    users?: number;
  };
}

export default function AcademicManagementPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isEditFacultyOpen, setIsEditFacultyOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const { toast } = useToast();

  const fetchFaculties = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/faculties?include=true');
      if (!response.ok) {
        throw new Error('Failed to fetch faculties');
      }
      const data = await response.json();
      setFaculties(data.faculties || []);
    } catch (error) {
      console.error('Fetch faculties error:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลคณะได้',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId);
    } else {
      newExpanded.add(facultyId);
    }
    setExpandedFaculties(newExpanded);
  };

  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const handleAddFaculty = async (formData: FormData) => {
    try {
      const response = await fetch('/api/faculties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: formData.get('nameTh'),
          nameEn: formData.get('nameEn'),
          code: formData.get('code'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาด');
      }

      toast({
        title: 'เพิ่มคณะสำเร็จ',
        description: 'คณะใหม่ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว',
      });

      setIsAddFacultyOpen(false);
      fetchFaculties();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มคณะได้',
      });
    }
  };

  const handleAddDepartment = async (formData: FormData) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: formData.get('nameTh'),
          nameEn: formData.get('nameEn'),
          code: formData.get('code'),
          facultyId: selectedFacultyId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาด');
      }

      toast({
        title: 'เพิ่มสาขาสำเร็จ',
        description: 'สาขาใหม่ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว',
      });

      setIsAddDepartmentOpen(false);
      setSelectedFacultyId('');
      fetchFaculties();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มสาขาได้',
      });
    }
  };

  const handleEditFaculty = async (formData: FormData) => {
    if (!editingFaculty) return;

    try {
      const response = await fetch(`/api/faculties/${editingFaculty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: formData.get('nameTh'),
          nameEn: formData.get('nameEn'),
          code: formData.get('code'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาด');
      }

      toast({
        title: 'แก้ไขคณะสำเร็จ',
        description: 'ข้อมูลคณะถูกอัปเดตเรียบร้อยแล้ว',
      });

      setIsEditFacultyOpen(false);
      setEditingFaculty(null);
      fetchFaculties();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถแก้ไขคณะได้',
      });
    }
  };

  const handleDeleteFaculty = async (faculty: Faculty) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคณะ "${faculty.nameTh}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/faculties/${faculty.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาด');
      }

      toast({
        title: 'ลบคณะสำเร็จ',
        description: 'คณะถูกลบออกจากระบบเรียบร้อยแล้ว',
      });

      fetchFaculties();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถลบคณะได้',
      });
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสาขา "${department.nameTh}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาด');
      }

      toast({
        title: 'ลบสาขาสำเร็จ',
        description: 'สาขาถูกลบออกจากระบบเรียบร้อยแล้ว',
      });

      fetchFaculties();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถลบสาขาได้',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการโครงสร้างวิชาการ</h1>
          <p className="text-muted-foreground">จัดการคณะ สาขา หลักสูตร และวิชาเอก</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddFacultyOpen} onOpenChange={setIsAddFacultyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มคณะ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มคณะใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลคณะที่ต้องการเพิ่ม
                </DialogDescription>
              </DialogHeader>
              <form action={handleAddFaculty} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nameTh">ชื่อคณะ (ไทย) *</Label>
                  <Input id="nameTh" name="nameTh" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">ชื่อคณะ (อังกฤษ)</Label>
                  <Input id="nameEn" name="nameEn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">รหัสคณะ</Label>
                  <Input id="code" name="code" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddFacultyOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">เพิ่มคณะ</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คณะทั้งหมด</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สาขาทั้งหมด</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.reduce((sum, faculty) => sum + (faculty._count?.departments || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.reduce((sum, faculty) => 
                sum + faculty.departments.reduce((deptSum, dept) => 
                  deptSum + (dept._count?.curriculums || 0), 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.reduce((sum, faculty) => sum + (faculty._count?.users || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Structure */}
      <Card>
        <CardHeader>
          <CardTitle>โครงสร้างวิชาการ</CardTitle>
          <CardDescription>คณะ สาขา หลักสูตร และวิชาเอก</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : faculties.length > 0 ? (
            <div className="space-y-4">
              {faculties.map((faculty) => (
                <div key={faculty.id} className="border rounded-lg">
                  <Collapsible
                    open={expandedFaculties.has(faculty.id)}
                    onOpenChange={() => toggleFaculty(faculty.id)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {expandedFaculties.has(faculty.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Building className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-semibold">{faculty.nameTh}</div>
                          {faculty.nameEn && (
                            <div className="text-sm text-muted-foreground">{faculty.nameEn}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {faculty._count?.departments || 0} สาขา
                        </Badge>
                        <Badge variant="outline">
                          {faculty._count?.users || 0} นักศึกษา
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacultyId(faculty.id);
                            setIsAddDepartmentOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          เพิ่มสาขา
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFaculty(faculty);
                                setIsEditFacultyOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFaculty(faculty);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        {faculty.departments.length > 0 ? (
                          <div className="space-y-2 ml-6">
                            {faculty.departments.map((department) => (
                              <div key={department.id} className="border-l-2 border-muted pl-4">
                                <Collapsible
                                  open={expandedDepartments.has(department.id)}
                                  onOpenChange={() => toggleDepartment(department.id)}
                                >
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/30 rounded">
                                    <div className="flex items-center gap-2">
                                      {expandedDepartments.has(department.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                      <GraduationCap className="h-4 w-4 text-green-600" />
                                      <div className="text-left">
                                        <div className="font-medium">{department.nameTh}</div>
                                        {department.nameEn && (
                                          <div className="text-xs text-muted-foreground">{department.nameEn}</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {department._count?.curriculums || 0} หลักสูตร
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {department._count?.users || 0} คน
                                      </Badge>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingDepartment(department);
                                              setIsEditDepartmentOpen(true);
                                            }}
                                          >
                                            <Edit className="h-3 w-3 mr-2" />
                                            แก้ไข
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDepartment(department);
                                            }}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            ลบ
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="ml-6 mt-2 space-y-1">
                                      {department.curriculums.map((curriculum) => (
                                        <div key={curriculum.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-sm">
                                          <BookOpen className="h-3 w-3 text-orange-600" />
                                          <div className="flex-1">
                                            <div className="font-medium">{curriculum.nameTh}</div>
                                            {curriculum.degree && (
                                              <Badge variant="outline" className="text-xs mt-1">
                                                {curriculum.degree}
                                              </Badge>
                                            )}
                                          </div>
                                          {curriculum.majors.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                              {curriculum.majors.length} วิชาเอก
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            ยังไม่มีสาขาในคณะนี้
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีข้อมูลคณะ
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Faculty Dialog */}
      <Dialog open={isEditFacultyOpen} onOpenChange={setIsEditFacultyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลคณะ</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลคณะ: {editingFaculty?.nameTh}
            </DialogDescription>
          </DialogHeader>
          <form action={handleEditFaculty} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-faculty-nameTh">ชื่อคณะ (ไทย) *</Label>
              <Input 
                id="edit-faculty-nameTh" 
                name="nameTh" 
                defaultValue={editingFaculty?.nameTh}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-faculty-nameEn">ชื่อคณะ (อังกฤษ)</Label>
              <Input 
                id="edit-faculty-nameEn" 
                name="nameEn" 
                defaultValue={editingFaculty?.nameEn || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-faculty-code">รหัสคณะ</Label>
              <Input 
                id="edit-faculty-code" 
                name="code" 
                defaultValue={editingFaculty?.code || ''}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditFacultyOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มสาขาใหม่</DialogTitle>
            <DialogDescription>
              เพิ่มสาขาใหม่ในคณะที่เลือก
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddDepartment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-nameTh">ชื่อสาขา (ไทย) *</Label>
              <Input id="dept-nameTh" name="nameTh" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-nameEn">ชื่อสาขา (อังกฤษ)</Label>
              <Input id="dept-nameEn" name="nameEn" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-code">รหัสสาขา</Label>
              <Input id="dept-code" name="code" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">เพิ่มสาขา</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDepartmentOpen} onOpenChange={setIsEditDepartmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสาขา</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลสาขา: {editingDepartment?.nameTh}
            </DialogDescription>
          </DialogHeader>
          <form action={async (formData) => {
            if (!editingDepartment) return;
            
            try {
              const response = await fetch(`/api/departments/${editingDepartment.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  nameTh: formData.get('nameTh'),
                  nameEn: formData.get('nameEn'),
                  code: formData.get('code'),
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'เกิดข้อผิดพลาด');
              }

              toast({
                title: 'แก้ไขสาขาสำเร็จ',
                description: 'ข้อมูลสาขาถูกอัปเดตเรียบร้อยแล้ว',
              });

              setIsEditDepartmentOpen(false);
              setEditingDepartment(null);
              fetchFaculties();
            } catch (error) {
              toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: error instanceof Error ? error.message : 'ไม่สามารถแก้ไขสาขาได้',
              });
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dept-nameTh">ชื่อสาขา (ไทย) *</Label>
              <Input 
                id="edit-dept-nameTh" 
                name="nameTh" 
                defaultValue={editingDepartment?.nameTh}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-nameEn">ชื่อสาขา (อังกฤษ)</Label>
              <Input 
                id="edit-dept-nameEn" 
                name="nameEn" 
                defaultValue={editingDepartment?.nameEn || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-code">รหัสสาขา</Label>
              <Input 
                id="edit-dept-code" 
                name="code" 
                defaultValue={editingDepartment?.code || ''}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDepartmentOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}