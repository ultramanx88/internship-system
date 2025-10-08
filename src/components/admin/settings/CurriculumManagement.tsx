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

interface Department {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  facultyId: string;
  isActive: boolean;
}

interface Faculty {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  isActive: boolean;
}

interface Curriculum {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  degree?: string;
  departmentId: string;
  isActive: boolean;
}

export function CurriculumManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [filterFacultyId, setFilterFacultyId] = useState<string>('');
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [newCurriculum, setNewCurriculum] = useState<Partial<Curriculum>>({
    nameTh: '',
    nameEn: '',
    code: '',
    degree: '',
    departmentId: '',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [facultiesRes, departmentsRes, curriculumsRes] = await Promise.all([
        fetch('/api/faculties'),
        fetch('/api/departments'),
        fetch('/api/curriculums')
      ]);

      if (facultiesRes.ok) {
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData.faculties || facultiesData);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData.departments || departmentsData);
      }

      if (curriculumsRes.ok) {
        const curriculumsData = await curriculumsRes.json();
        setCurriculums(curriculumsData.curriculums || curriculumsData);
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

  const handleAddCurriculum = () => {
    if (!newCurriculum.nameTh || !newCurriculum.departmentId) {
      toast({
        variant: 'destructive',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        description: 'กรุณากรอกชื่อหลักสูตรและเลือกสาขา'
      });
      return;
    }

    const curriculum: Curriculum = {
      id: `new-${Date.now()}`,
      nameTh: newCurriculum.nameTh,
      nameEn: newCurriculum.nameEn || '',
      code: newCurriculum.code || '',
      degree: newCurriculum.degree || '',
      departmentId: newCurriculum.departmentId,
      isActive: true
    };

    setCurriculums(prev => [...prev, curriculum]);
    setNewCurriculum({
      nameTh: '',
      nameEn: '',
      code: '',
      degree: '',
      departmentId: '',
      isActive: true
    });
    setSelectedFacultyId('');

    toast({
      title: 'เพิ่มหลักสูตรเรียบร้อย',
      description: 'หลักสูตรใหม่ถูกเพิ่มลงในรายการแล้ว'
    });
  };

  const handleEditCurriculum = (id: string) => {
    setEditingId(id);
  };

  const handleSaveCurriculum = async (id: string) => {
    try {
      const curriculum = curriculums.find(c => c.id === id);
      if (!curriculum) return;

      const response = await fetch('/api/curriculums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([curriculum])
      });

      if (response.ok) {
        setEditingId(null);
        toast({
          title: 'บันทึกสำเร็จ',
          description: 'ข้อมูลหลักสูตรได้รับการอัปเดตเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to save curriculum');
      }
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลหลักสูตรได้'
      });
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหลักสูตรนี้?')) return;

    try {
      const response = await fetch(`/api/curriculums/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCurriculums(prev => prev.filter(c => c.id !== id));
        toast({
          title: 'ลบสำเร็จ',
          description: 'หลักสูตรถูกลบเรียบร้อยแล้ว'
        });
      } else {
        throw new Error('Failed to delete curriculum');
      }
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบหลักสูตรได้'
      });
    }
  };

  const handleCurriculumChange = (id: string, field: keyof Curriculum, value: string | boolean) => {
    setCurriculums(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.nameTh : 'ไม่ระบุ';
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
      {/* Add New Curriculum */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มหลักสูตรใหม่</CardTitle>
          <CardDescription>เพิ่มหลักสูตรใหม่และเลือกสาขาที่หลักสูตรนั้นสังกัด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="faculty">คณะ</Label>
              <Select
                value={selectedFacultyId}
                onValueChange={(value) => {
                  setSelectedFacultyId(value);
                  setNewCurriculum(prev => ({ ...prev, departmentId: '' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคณะเพื่อกรองสาขา" />
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
              <Label htmlFor="department">สาขา *</Label>
              <Select
                value={newCurriculum.departmentId || ''}
                onValueChange={(value) => setNewCurriculum(prev => ({ ...prev, departmentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter(d => !selectedFacultyId || d.facultyId === selectedFacultyId)
                    .map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nameTh">ชื่อหลักสูตร (ไทย) *</Label>
              <Input
                id="nameTh"
                value={newCurriculum.nameTh || ''}
                onChange={(e) => setNewCurriculum(prev => ({ ...prev, nameTh: e.target.value }))}
                placeholder="เช่น บช.บ.การบัญชี"
              />
            </div>
            <div>
              <Label htmlFor="nameEn">ชื่อหลักสูตร (อังกฤษ)</Label>
              <Input
                id="nameEn"
                value={newCurriculum.nameEn || ''}
                onChange={(e) => setNewCurriculum(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="e.g. B.B.A Accounting"
              />
            </div>
            <div>
              <Label htmlFor="code">รหัสหลักสูตร</Label>
              <Input
                id="code"
                value={newCurriculum.code || ''}
                onChange={(e) => setNewCurriculum(prev => ({ ...prev, code: e.target.value }))}
                placeholder="เช่น ACC"
              />
            </div>
            <div>
              <Label htmlFor="degree">ระดับปริญญา</Label>
              <Input
                id="degree"
                value={newCurriculum.degree || ''}
                onChange={(e) => setNewCurriculum(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="เช่น ปริญญาตรี"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleAddCurriculum}>
              <PlusCircle className="h-4 w-4 mr-2" />
              เพิ่มหลักสูตร
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Curriculums List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการหลักสูตร</CardTitle>
          <CardDescription>จัดการข้อมูลหลักสูตรทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>กรองตามคณะ</Label>
              <Select
                value={filterFacultyId}
                onValueChange={(value) => { setFilterFacultyId(value); setFilterDepartmentId(''); }}
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
            <div>
              <Label>กรองตามสาขา</Label>
              <Select
                value={filterDepartmentId}
                onValueChange={(value) => setFilterDepartmentId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {departments
                    .filter(d => !filterFacultyId || d.facultyId === filterFacultyId)
                    .map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.nameTh}
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
                  <TableHead>สาขา</TableHead>
                  <TableHead>ชื่อหลักสูตร (ไทย)</TableHead>
                  <TableHead>ชื่อหลักสูตร (อังกฤษ)</TableHead>
                  <TableHead>รหัสหลักสูตร</TableHead>
                  <TableHead>ระดับปริญญา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {curriculums
                  .filter(c => !filterDepartmentId || c.departmentId === filterDepartmentId)
                  .filter(c => !filterFacultyId || departments.find(d => d.id === c.departmentId)?.facultyId === filterFacultyId)
                  .map((curriculum) => (
                  <TableRow key={curriculum.id}>
                    <TableCell>
                      {editingId === curriculum.id ? (
                        <Select
                          value={curriculum.departmentId}
                          onValueChange={(value) => handleCurriculumChange(curriculum.id, 'departmentId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id}>
                                {department.nameTh}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getDepartmentName(curriculum.departmentId)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === curriculum.id ? (
                        <Input
                          value={curriculum.nameTh}
                          onChange={(e) => handleCurriculumChange(curriculum.id, 'nameTh', e.target.value)}
                        />
                      ) : (
                        curriculum.nameTh
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === curriculum.id ? (
                        <Input
                          value={curriculum.nameEn || ''}
                          onChange={(e) => handleCurriculumChange(curriculum.id, 'nameEn', e.target.value)}
                        />
                      ) : (
                        curriculum.nameEn || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === curriculum.id ? (
                        <Input
                          value={curriculum.code || ''}
                          onChange={(e) => handleCurriculumChange(curriculum.id, 'code', e.target.value)}
                        />
                      ) : (
                        curriculum.code || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === curriculum.id ? (
                        <Input
                          value={curriculum.degree || ''}
                          onChange={(e) => handleCurriculumChange(curriculum.id, 'degree', e.target.value)}
                        />
                      ) : (
                        curriculum.degree || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={curriculum.isActive ? 'default' : 'secondary'}>
                        {curriculum.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === curriculum.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveCurriculum(curriculum.id)}
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
                              onClick={() => handleEditCurriculum(curriculum.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCurriculum(curriculum.id)}
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

