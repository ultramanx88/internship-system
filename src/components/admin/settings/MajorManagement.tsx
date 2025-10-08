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

interface Curriculum {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  degree?: string;
  departmentId: string;
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

interface Major {
  id: string;
  nameTh: string;
  nameEn?: string;
  curriculumId: string;
  isActive: boolean;
}

export function MajorManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [filterFacultyId, setFilterFacultyId] = useState<string>('');
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterCurriculumId, setFilterCurriculumId] = useState<string>('');
  const [newMajor, setNewMajor] = useState<Partial<Major>>({
    nameTh: '',
    nameEn: '',
    curriculumId: '',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [departmentsRes, curriculumsRes, majorsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/curriculums'),
        fetch('/api/majors')
      ]);

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData.departments || departmentsData);
      }

      if (curriculumsRes.ok) {
        const curriculumsData = await curriculumsRes.json();
        setCurriculums(curriculumsData.curriculums || curriculumsData);
      }

      if (majorsRes.ok) {
        const majorsData = await majorsRes.json();
        setMajors(majorsData.majors || majorsData);
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

  const handleAddMajor = () => {
    if (!newMajor.nameTh || !newMajor.curriculumId) {
      toast({
        variant: 'destructive',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        description: 'กรุณากรอกชื่อวิชาเอกและเลือกหลักสูตร'
      });
      return;
    }

    const major: Major = {
      id: `new-${Date.now()}`,
      nameTh: newMajor.nameTh,
      nameEn: newMajor.nameEn || '',
      curriculumId: newMajor.curriculumId,
      isActive: true
    };

    setMajors(prev => [...prev, major]);
    setNewMajor({
      nameTh: '',
      nameEn: '',
      curriculumId: '',
      isActive: true
    });
    setSelectedDepartmentId('');

    toast({
      title: 'เพิ่มวิชาเอกเรียบร้อย',
      description: 'วิชาเอกใหม่ถูกเพิ่มลงในรายการแล้ว'
    });
  };

  const handleEditMajor = (id: string) => {
    setEditingId(id);
  };

  const handleSaveMajor = async (id: string) => {
    try {
      const major = majors.find(m => m.id === id);
      if (!major) return;

      const response = await fetch('/api/majors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([major])
      });

      if (response.ok) {
        setEditingId(null);
        toast({
          title: 'บันทึกสำเร็จ',
          description: 'ข้อมูลวิชาเอกได้รับการอัปเดตเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to save major');
      }
    } catch (error) {
      console.error('Error saving major:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลวิชาเอกได้'
      });
    }
  };

  const handleDeleteMajor = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบวิชาเอกนี้?')) return;

    try {
      const response = await fetch(`/api/majors/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMajors(prev => prev.filter(m => m.id !== id));
        toast({
          title: 'ลบสำเร็จ',
          description: 'วิชาเอกถูกลบเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to delete major');
      }
    } catch (error) {
      console.error('Error deleting major:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบวิชาเอกได้'
      });
    }
  };

  const handleMajorChange = (id: string, field: keyof Major, value: string | boolean) => {
    setMajors(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const getCurriculumName = (curriculumId: string) => {
    const curriculum = curriculums.find(c => c.id === curriculumId);
    return curriculum ? curriculum.nameTh : 'ไม่ระบุ';
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
      {/* Add New Major */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มวิชาเอกใหม่</CardTitle>
          <CardDescription>เพิ่มวิชาเอกใหม่และเลือกหลักสูตรที่วิชาเอกนั้นสังกัด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="department">สาขา</Label>
              <Select
                value={selectedDepartmentId}
                onValueChange={(value) => {
                  setSelectedDepartmentId(value);
                  setNewMajor(prev => ({ ...prev, curriculumId: '' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขาเพื่อกรองหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="curriculum">หลักสูตร *</Label>
              <Select
                value={newMajor.curriculumId || ''}
                onValueChange={(value) => setNewMajor(prev => ({ ...prev, curriculumId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  {curriculums
                    .filter(c => !selectedDepartmentId || c.departmentId === selectedDepartmentId)
                    .map((curriculum) => (
                    <SelectItem key={curriculum.id} value={curriculum.id}>
                      {curriculum.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nameTh">ชื่อวิชาเอก (ไทย) *</Label>
              <Input
                id="nameTh"
                value={newMajor.nameTh || ''}
                onChange={(e) => setNewMajor(prev => ({ ...prev, nameTh: e.target.value }))}
                placeholder="เช่น การจัดการธุรกิจ"
              />
            </div>
            <div>
              <Label htmlFor="nameEn">ชื่อวิชาเอก (อังกฤษ)</Label>
              <Input
                id="nameEn"
                value={newMajor.nameEn || ''}
                onChange={(e) => setNewMajor(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="e.g. Business Management"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleAddMajor}>
              <PlusCircle className="h-4 w-4 mr-2" />
              เพิ่มวิชาเอก
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Majors List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการวิชาเอก</CardTitle>
          <CardDescription>จัดการข้อมูลวิชาเอกทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>กรองตามสาขา</Label>
              <Select
                value={filterDepartmentId}
                onValueChange={(value) => { setFilterDepartmentId(value); setFilterCurriculumId(''); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>กรองตามหลักสูตร</Label>
              <Select
                value={filterCurriculumId}
                onValueChange={(value) => setFilterCurriculumId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {curriculums
                    .filter(c => !filterDepartmentId || c.departmentId === filterDepartmentId)
                    .map((curriculum) => (
                      <SelectItem key={curriculum.id} value={curriculum.id}>
                        {curriculum.nameTh}
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
                  <TableHead>หลักสูตร</TableHead>
                  <TableHead>ชื่อวิชาเอก (ไทย)</TableHead>
                  <TableHead>ชื่อวิชาเอก (อังกฤษ)</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {majors
                  .filter(m => !filterCurriculumId || m.curriculumId === filterCurriculumId)
                  .filter(m => !filterDepartmentId || curriculums.find(c => c.id === m.curriculumId)?.departmentId === filterDepartmentId)
                  .map((major) => (
                  <TableRow key={major.id}>
                    <TableCell>
                      {editingId === major.id ? (
                        <Select
                          value={major.curriculumId}
                          onValueChange={(value) => handleMajorChange(major.id, 'curriculumId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {curriculums.map((curriculum) => (
                              <SelectItem key={curriculum.id} value={curriculum.id}>
                                {curriculum.nameTh}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getCurriculumName(major.curriculumId)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === major.id ? (
                        <Input
                          value={major.nameTh}
                          onChange={(e) => handleMajorChange(major.id, 'nameTh', e.target.value)}
                        />
                      ) : (
                        major.nameTh
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === major.id ? (
                        <Input
                          value={major.nameEn || ''}
                          onChange={(e) => handleMajorChange(major.id, 'nameEn', e.target.value)}
                        />
                      ) : (
                        major.nameEn || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={major.isActive ? 'default' : 'secondary'}>
                        {major.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === major.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveMajor(major.id)}
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
                              onClick={() => handleEditMajor(major.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMajor(major.id)}
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