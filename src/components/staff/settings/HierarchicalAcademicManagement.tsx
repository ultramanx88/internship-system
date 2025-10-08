'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save, Trash2, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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

interface Curriculum {
  id: string;
  nameTh: string;
  nameEn?: string;
  code?: string;
  degree?: string;
  departmentId: string;
  isActive: boolean;
}

interface Major {
  id: string;
  nameTh: string;
  nameEn?: string;
  curriculumId: string;
  area?: string;
  isActive: boolean;
}

export default function StaffHierarchicalAcademicManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadAcademicData = async () => {
      setIsLoading(true);
      try {
        const [facultiesRes, departmentsRes, curriculumsRes, majorsRes] = await Promise.all([
          fetch('/api/faculties'),
          fetch('/api/departments'),
          fetch('/api/curriculums'),
          fetch('/api/majors')
        ]);

        const [facultiesData, departmentsData, curriculumsData, majorsData] = await Promise.all([
          facultiesRes.json(),
          departmentsRes.json(),
          curriculumsRes.json(),
          majorsRes.json()
        ]);

        setFaculties(facultiesData.faculties || []);
        setDepartments(departmentsData.departments || []);
        setCurriculums(curriculumsData.curriculums || []);
        setMajors(majorsData.majors || []);
      } catch (error) {
        console.error('Error loading academic data:', error);
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลได้',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAcademicData();
  }, [toast]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddFaculty = () => {
    const newFaculty: Faculty = {
      id: `new-faculty-${Date.now()}`,
      nameTh: '',
      nameEn: '',
      code: '',
      isActive: true,
    };
    setFaculties(prev => [...prev, newFaculty]);
  };

  const handleFacultyChange = (id: string, field: keyof Faculty, value: string | boolean) => {
    setFaculties(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleRemoveFaculty = (id: string) => {
    setFaculties(prev => prev.filter(f => f.id !== id));
    setDepartments(prev => prev.filter(d => d.facultyId !== id));
  };

  const handleAddDepartment = (facultyId: string) => {
    const newDepartment: Department = {
      id: `new-department-${Date.now()}`,
      nameTh: '',
      nameEn: '',
      code: '',
      facultyId,
      isActive: true,
    };
    setDepartments(prev => [...prev, newDepartment]);
  };

  const handleDepartmentChange = (id: string, field: keyof Department, value: string | boolean) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleRemoveDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    setCurriculums(prev => prev.filter(c => c.departmentId !== id));
  };

  const handleAddCurriculum = (departmentId: string) => {
    const newCurriculum: Curriculum = {
      id: `new-curriculum-${Date.now()}`,
      nameTh: '',
      nameEn: '',
      code: '',
      degree: '',
      departmentId,
      isActive: true,
    };
    setCurriculums(prev => [...prev, newCurriculum]);
  };

  const handleCurriculumChange = (id: string, field: keyof Curriculum, value: string | boolean) => {
    setCurriculums(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveCurriculum = (id: string) => {
    setCurriculums(prev => prev.filter(c => c.id !== id));
    setMajors(prev => prev.filter(m => m.curriculumId !== id));
  };

  const handleAddMajor = (curriculumId: string) => {
    const newMajor: Major = {
      id: `new-major-${Date.now()}`,
      nameTh: '',
      nameEn: '',
      curriculumId,
      area: '',
      isActive: true,
    };
    setMajors(prev => [...prev, newMajor]);
  };

  const handleMajorChange = (id: string, field: keyof Major, value: string | boolean) => {
    setMajors(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMajor = (id: string) => {
    setMajors(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        fetch('/api/faculties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faculties) }),
        fetch('/api/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(departments) }),
        fetch('/api/curriculums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(curriculums) }),
        fetch('/api/majors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(majors) }),
      ]);

      toast({ title: 'บันทึกสำเร็จ', description: 'อัปเดตโครงสร้างข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error saving hierarchical data:', error);
      toast({ variant: 'destructive', title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้' });
    } finally {
      setIsSaving(false);
    }
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
        <CardTitle>จัดการโครงสร้างวิชา (คณะ → สาขา → หลักสูตร → วิชาเอก)</CardTitle>
        <CardDescription>เพิ่ม/แก้ไขข้อมูลแบบลำดับชั้น สำหรับบุคลากร</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onClick={() => toggleExpanded(faculty.id)}>
                  {expandedItems.has(faculty.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>ชื่อคณะ (ไทย) *</Label>
                    <Input value={faculty.nameTh} onChange={(e) => handleFacultyChange(faculty.id, 'nameTh', e.target.value)} placeholder="เช่น คณะวิทยาศาสตร์และเทคโนโลยี" />
                  </div>
                  <div>
                    <Label>ชื่อคณะ (อังกฤษ)</Label>
                    <Input value={faculty.nameEn || ''} onChange={(e) => handleFacultyChange(faculty.id, 'nameEn', e.target.value)} placeholder="e.g. Faculty of Science and Technology" />
                  </div>
                  <div>
                    <Label>รหัสคณะ</Label>
                    <Input value={faculty.code || ''} onChange={(e) => handleFacultyChange(faculty.id, 'code', e.target.value)} placeholder="เช่น FST" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAddDepartment(faculty.id)}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    เพิ่มสาขา
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFaculty(faculty.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedItems.has(faculty.id) && (
                <div className="ml-8 space-y-3">
                  {departments.filter(d => d.facultyId === faculty.id).map((department) => (
                    <div key={department.id} className="border-l-2 border-blue-200 pl-4">
                      <div className="flex items-center gap-4 mb-3">
                        <Button variant="ghost" size="sm" onClick={() => toggleExpanded(department.id)}>
                          {expandedItems.has(department.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>ชื่อสาขา (ไทย) *</Label>
                            <Input value={department.nameTh} onChange={(e) => handleDepartmentChange(department.id, 'nameTh', e.target.value)} placeholder="เช่น สาขาวิชาเทคโนโลยีสารสนเทศ" />
                          </div>
                          <div>
                            <Label>ชื่อสาขา (อังกฤษ)</Label>
                            <Input value={department.nameEn || ''} onChange={(e) => handleDepartmentChange(department.id, 'nameEn', e.target.value)} placeholder="e.g. Department of Information Technology" />
                          </div>
                          <div>
                            <Label>รหัสสาขา</Label>
                            <Input value={department.code || ''} onChange={(e) => handleDepartmentChange(department.id, 'code', e.target.value)} placeholder="เช่น IT" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddCurriculum(department.id)}>
                            <PlusCircle className="h-4 w-4 mr-1" />
                            เพิ่มหลักสูตร
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveDepartment(department.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedItems.has(department.id) && (
                        <div className="ml-8 space-y-3">
                          {curriculums.filter(c => c.departmentId === department.id).map((curriculum) => (
                            <div key={curriculum.id} className="border-l-2 border-green-200 pl-4">
                              <div className="flex items-center gap-4 mb-3">
                                <Button variant="ghost" size="sm" onClick={() => toggleExpanded(curriculum.id)}>
                                  {expandedItems.has(curriculum.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label>ชื่อหลักสูตร (ไทย) *</Label>
                                    <Input value={curriculum.nameTh} onChange={(e) => handleCurriculumChange(curriculum.id, 'nameTh', e.target.value)} placeholder="เช่น เทคโนโลยีสารสนเทศ" />
                                  </div>
                                  <div>
                                    <Label>ชื่อหลักสูตร (อังกฤษ)</Label>
                                    <Input value={curriculum.nameEn || ''} onChange={(e) => handleCurriculumChange(curriculum.id, 'nameEn', e.target.value)} placeholder="e.g. Information Technology" />
                                  </div>
                                  <div>
                                    <Label>รหัสหลักสูตร</Label>
                                    <Input value={curriculum.code || ''} onChange={(e) => handleCurriculumChange(curriculum.id, 'code', e.target.value)} placeholder="เช่น IT" />
                                  </div>
                                  <div>
                                    <Label>ระดับปริญญา</Label>
                                    <Input value={curriculum.degree || ''} onChange={(e) => handleCurriculumChange(curriculum.id, 'degree', e.target.value)} placeholder="เช่น ปริญญาตรี" />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleAddMajor(curriculum.id)}>
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    เพิ่มวิชาเอก
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCurriculum(curriculum.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {expandedItems.has(curriculum.id) && (
                                <div className="ml-8 space-y-2">
                                  {majors.filter(m => m.curriculumId === curriculum.id).map((major) => (
                                    <div key={major.id} className="border-l-2 border-purple-200 pl-4">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div>
                                            <Label>ชื่อวิชาเอก (ไทย) *</Label>
                                            <Input value={major.nameTh} onChange={(e) => handleMajorChange(major.id, 'nameTh', e.target.value)} placeholder="เช่น เทคโนโลยีสารสนเทศ" />
                                          </div>
                                          <div>
                                            <Label>ชื่อวิชาเอก (อังกฤษ)</Label>
                                            <Input value={major.nameEn || ''} onChange={(e) => handleMajorChange(major.id, 'nameEn', e.target.value)} placeholder="e.g. Information Technology" />
                                          </div>
                                          <div>
                                            <Label>สาขาเฉพาะ</Label>
                                            <Input value={major.area || ''} onChange={(e) => handleMajorChange(major.id, 'area', e.target.value)} placeholder="เช่น Software Engineering" />
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveMajor(major.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleAddFaculty} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มคณะ
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


