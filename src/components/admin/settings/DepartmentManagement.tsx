'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Save, Trash2, Loader2, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Faculty {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  isActive: boolean;
}

interface Department {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  facultyId: string;
  isActive: boolean;
}

export function DepartmentManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterFacultyId, setFilterFacultyId] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    nameTh: '',
    nameEn: '',
    code: '',
    facultyId: '',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [facultiesRes, departmentsRes] = await Promise.all([
        fetch('/api/faculties'),
        fetch('/api/departments')
      ]);

      if (facultiesRes.ok) {
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData.faculties || facultiesData);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData.departments || departmentsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลได้'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = () => {
    if (!newDepartment.nameTh || !newDepartment.facultyId) {
      toast({
        variant: 'destructive',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        description: 'กรุณากรอกชื่อสาขาและเลือกคณะ'
      });
      return;
    }

    const department: Department = {
      id: `new-${Date.now()}`,
      nameTh: newDepartment.nameTh,
      nameEn: newDepartment.nameEn || '',
      code: newDepartment.code || '',
      facultyId: newDepartment.facultyId,
      isActive: true
    };

    setDepartments(prev => [...prev, department]);
    setNewDepartment({
      nameTh: '',
      nameEn: '',
      code: '',
      facultyId: '',
      isActive: true
    });

    toast({
      title: 'เพิ่มสาขาเรียบร้อย',
      description: 'สาขาใหม่ถูกเพิ่มลงในรายการแล้ว'
    });
  };

  const handleEditDepartment = (id: string) => {
    setEditingId(id);
  };

  const handleSaveDepartment = async (id: string) => {
    try {
      const department = departments.find(d => d.id === id);
      if (!department) return;

      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([department])
      });

      if (response.ok) {
        setEditingId(null);
        toast({
          title: 'บันทึกสำเร็จ',
          description: 'ข้อมูลสาขาได้รับการอัปเดตเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลสาขาได้'
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสาขานี้?')) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDepartments(prev => prev.filter(d => d.id !== id));
        toast({
          title: 'ลบสำเร็จ',
          description: 'สาขาถูกลบเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบสาขาได้'
      });
    }
  };

  const handleDepartmentChange = (id: string, field: keyof Department, value: string | boolean) => {
    setDepartments(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.nameTh : 'ไม่ระบุ';
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
    <div className="space-y-6">
      {/* Add New Department */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มสาขาใหม่</CardTitle>
          <CardDescription>เพิ่มสาขาใหม่และเลือกคณะที่สาขานั้นสังกัด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="faculty">คณะ *</Label>
              <Select
                value={newDepartment.facultyId || ''}
                onValueChange={(value) => setNewDepartment(prev => ({ ...prev, facultyId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nameTh">ชื่อสาขา (ไทย) *</Label>
              <Input
                id="nameTh"
                value={newDepartment.nameTh || ''}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, nameTh: e.target.value }))}
                placeholder="เช่น สาขาวิทยาการคอมพิวเตอร์"
              />
            </div>
            <div>
              <Label htmlFor="nameEn">ชื่อสาขา (อังกฤษ)</Label>
              <Input
                id="nameEn"
                value={newDepartment.nameEn || ''}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="code">รหัสสาขา</Label>
              <Input
                id="code"
                value={newDepartment.code || ''}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
                placeholder="เช่น CS"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleAddDepartment}>
              <PlusCircle className="h-4 w-4 mr-2" />
              เพิ่มสาขา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสาขา</CardTitle>
          <CardDescription>จัดการข้อมูลสาขาทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterFaculty">กรองตามคณะ</Label>
              <Select
                value={filterFacultyId}
                onValueChange={(value) => setFilterFacultyId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>คณะ</TableHead>
                  <TableHead>ชื่อสาขา (ไทย)</TableHead>
                  <TableHead>ชื่อสาขา (อังกฤษ)</TableHead>
                  <TableHead>รหัสสาขา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments
                  .filter(d => !filterFacultyId || d.facultyId === filterFacultyId)
                  .map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      {editingId === department.id ? (
                        <Select
                          value={department.facultyId}
                          onValueChange={(value) => handleDepartmentChange(department.id, 'facultyId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.map((faculty) => (
                              <SelectItem key={faculty.id} value={faculty.id}>
                                {faculty.nameTh}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getFacultyName(department.facultyId)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === department.id ? (
                        <Input
                          value={department.nameTh}
                          onChange={(e) => handleDepartmentChange(department.id, 'nameTh', e.target.value)}
                        />
                      ) : (
                        department.nameTh
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === department.id ? (
                        <Input
                          value={department.nameEn || ''}
                          onChange={(e) => handleDepartmentChange(department.id, 'nameEn', e.target.value)}
                        />
                      ) : (
                        department.nameEn || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === department.id ? (
                        <Input
                          value={department.code || ''}
                          onChange={(e) => handleDepartmentChange(department.id, 'code', e.target.value)}
                        />
                      ) : (
                        department.code || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? 'default' : 'secondary'}>
                        {department.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === department.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveDepartment(department.id)}
                              disabled={isSaving}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDepartment(department.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDepartment(department.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

