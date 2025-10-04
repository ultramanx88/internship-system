'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface CourseCategory {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
}

interface Faculty {
  id: string;
  name: string;
  nameEn?: string;
}

interface Department {
  id: string;
  name: string;
  nameEn?: string;
}

interface Curriculum {
  id: string;
  name: string;
  nameEn?: string;
}

interface Major {
  id: string;
  name: string;
  nameEn?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  credits: number;
  category?: CourseCategory;
  faculty?: Faculty;
  department?: Department;
  curriculum?: Curriculum;
  major?: Major;
  isActive: boolean;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    description: '',
    credits: 3,
    categoryId: '',
    facultyId: '',
    departmentId: '',
    curriculumId: '',
    majorId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [coursesRes, categoriesRes, facultiesRes, departmentsRes, curriculumsRes, majorsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/course-categories'),
        fetch('/api/faculties'),
        fetch('/api/departments'),
        fetch('/api/curriculums'),
        fetch('/api/majors')
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      } else {
        console.error('Failed to fetch courses');
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } else {
        console.error('Failed to fetch course categories');
      }

      if (facultiesRes.ok) {
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData);
      } else {
        console.error('Failed to fetch faculties');
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      } else {
        console.error('Failed to fetch departments');
      }

      if (curriculumsRes.ok) {
        const curriculumsData = await curriculumsRes.json();
        setCurriculums(curriculumsData);
      } else {
        console.error('Failed to fetch curriculums');
      }

      if (majorsRes.ok) {
        const majorsData = await majorsRes.json();
        setMajors(majorsData);
      } else {
        console.error('Failed to fetch majors');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        setIsCreating(false);
        resetForm();
        toast.success('สร้างวิชาเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        toast.error(error.error || 'เกิดข้อผิดพลาดในการสร้างวิชา');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างวิชา');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(courses.map(course => 
          course.id === editingCourse.id ? updatedCourse : course
        ));
        setEditingCourse(null);
        resetForm();
        toast.success('อัปเดตวิชาเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        toast.error(error.error || 'เกิดข้อผิดพลาดในการอัปเดตวิชา');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตวิชา');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบวิชานี้?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('ลบวิชาเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        toast.error(error.error || 'เกิดข้อผิดพลาดในการลบวิชา');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('เกิดข้อผิดพลาดในการลบวิชา');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nameEn: '',
      description: '',
      credits: 3,
      categoryId: '',
      facultyId: '',
      departmentId: '',
      curriculumId: '',
      majorId: ''
    });
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      nameEn: course.nameEn || '',
      description: course.description || '',
      credits: course.credits,
      categoryId: course.category?.id || '',
      facultyId: course.faculty?.id || '',
      departmentId: course.department?.id || '',
      curriculumId: course.curriculum?.id || '',
      majorId: course.major?.id || ''
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !selectedFaculty || course.faculty?.id === selectedFaculty;
    const matchesDepartment = !selectedDepartment || course.department?.id === selectedDepartment;
    const matchesCurriculum = !selectedCurriculum || course.curriculum?.id === selectedCurriculum;
    const matchesMajor = !selectedMajor || course.major?.id === selectedMajor;

    return matchesSearch && matchesFaculty && matchesDepartment && matchesCurriculum && matchesMajor;
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">จัดการวิชา</h2>
          <p className="text-gray-600">จัดการข้อมูลวิชาและหลักสูตร</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มวิชาใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ค้นหาด้วยรหัสหรือชื่อวิชา"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="faculty">คณะ</Label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">ภาควิชา</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกภาควิชา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="curriculum">หลักสูตร</Label>
              <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {curriculums.map(curriculum => (
                    <SelectItem key={curriculum.id} value={curriculum.id}>
                      {curriculum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="major">สาขา</Label>
              <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {majors.map(major => (
                    <SelectItem key={major.id} value={major.id}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="grid gap-4">
        {filteredCourses.map(course => (
          <Card key={course.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    <Badge variant="outline">{course.code}</Badge>
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </div>
                  {course.nameEn && (
                    <p className="text-sm text-gray-600">{course.nameEn}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>หน่วยกิต: {course.credits}</span>
                    {course.category && <span>หมวดหมู่: {course.category.name}</span>}
                    {course.faculty && <span>คณะ: {course.faculty.name}</span>}
                    {course.department && <span>ภาควิชา: {course.department.name}</span>}
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-600">{course.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingCourse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'เพิ่มวิชาใหม่' : 'แก้ไขวิชา'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">รหัสวิชา *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="เช่น IT101"
                  />
                </div>
                <div>
                  <Label htmlFor="credits">หน่วยกิต</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 3})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="name">ชื่อวิชา (ไทย) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="เช่น เทคโนโลยีสารสนเทศ"
                />
              </div>
              
              <div>
                <Label htmlFor="nameEn">ชื่อวิชา (อังกฤษ)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  placeholder="เช่น Information Technology"
                />
              </div>
              
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="คำอธิบายวิชา"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="faculty">คณะ</Label>
                  <Select value={formData.facultyId} onValueChange={(value) => setFormData({...formData, facultyId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคณะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map(faculty => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">ภาควิชา</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({...formData, departmentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกภาควิชา" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="curriculum">หลักสูตร</Label>
                  <Select value={formData.curriculumId} onValueChange={(value) => setFormData({...formData, curriculumId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculums.map(curriculum => (
                        <SelectItem key={curriculum.id} value={curriculum.id}>
                          {curriculum.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="major">สาขา</Label>
                <Select value={formData.majorId} onValueChange={(value) => setFormData({...formData, majorId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map(major => (
                      <SelectItem key={major.id} value={major.id}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </Select>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={isCreating ? handleCreateCourse : handleUpdateCourse}
                  disabled={!formData.code || !formData.name}
                >
                  {isCreating ? 'สร้าง' : 'อัปเดต'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
