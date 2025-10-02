'use client';

import { useState } from 'react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { ValidatedInput, NameInputGroup } from '@/components/ui/validated-input';
import { Search, Filter, Plus, Download, Trash2, Grid, List, ChevronLeft, ChevronRight, Upload, FileSpreadsheet, UserPlus, X } from 'lucide-react';

export default function StudentsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

    // คำนำหน้าสำหรับ dropdown
    const thaiPrefixes = [
        { value: 'นาย', label: 'นาย' },
        { value: 'นาง', label: 'นาง' },
        { value: 'นางสาว', label: 'นางสาว' },
        { value: 'ดร.', label: 'ดร.' },
        { value: 'ศ.ดร.', label: 'ศ.ดร.' },
        { value: 'รศ.ดร.', label: 'รศ.ดร.' },
        { value: 'ผศ.ดร.', label: 'ผศ.ดร.' }
    ];

    const englishPrefixes = [
        { value: 'Mr.', label: 'Mr.' },
        { value: 'Mrs.', label: 'Mrs.' },
        { value: 'Miss', label: 'Miss' },
        { value: 'Ms.', label: 'Ms.' },
        { value: 'Dr.', label: 'Dr.' },
        { value: 'Prof.', label: 'Prof.' },
        { value: 'Assoc.Prof.', label: 'Assoc.Prof.' },
        { value: 'Asst.Prof.', label: 'Asst.Prof.' }
    ];
    const [newStudent, setNewStudent] = useState({
        studentId: '',
        facultyId: '',
        departmentId: '',
        curriculumId: '',
        majorId: '',
        studentYear: '',
        thaiPrefix: '',
        thaiName: '',
        thaiMiddleName: '',
        thaiSurname: '',
        englishPrefix: '',
        englishName: '',
        englishMiddleName: '',
        englishSurname: '',
        email: '',
        password: '12345678', // ค่าเริ่มต้น
        roles: ['student'] as string[]
    });

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);

    // Data for dropdowns
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [curriculums, setCurriculums] = useState<any[]>([]);
    const [majors, setMajors] = useState<any[]>([]);

    // Validation states
    const [formValidation, setFormValidation] = useState({
        thaiName: false,
        englishName: false,
        isValid: false
    });

    // Fetch students data from API
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                role: 'student',
                search: searchTerm,
                page: currentPage.toString(),
                limit: '10',
                include: 'relations' // Request to include faculty, department, curriculum, major relations
            });

            const response = await fetch(`/api/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setStudents(data.users || []);
                setTotalPages(data.totalPages || 1);
                setTotalStudents(data.total || 0);
            } else {
                console.error('Failed to fetch students:', data.message);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch faculties data
    const fetchFaculties = async () => {
        try {
            const response = await fetch('/api/faculties');
            const data = await response.json();
            if (response.ok) {
                setFaculties(data.faculties || []);
            }
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    // Fetch departments based on selected faculty
    const fetchDepartments = async (facultyId: string) => {
        try {
            const response = await fetch(`/api/departments?facultyId=${facultyId}`);
            const data = await response.json();
            if (response.ok) {
                setDepartments(data.departments || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // Fetch curriculums based on selected department
    const fetchCurriculums = async (departmentId: string) => {
        try {
            const response = await fetch(`/api/curriculums?departmentId=${departmentId}`);
            const data = await response.json();
            if (response.ok) {
                setCurriculums(data.curriculums || []);
            }
        } catch (error) {
            console.error('Error fetching curriculums:', error);
        }
    };

    // Fetch majors based on selected curriculum
    const fetchMajors = async (curriculumId: string) => {
        try {
            const response = await fetch(`/api/majors?curriculumId=${curriculumId}`);
            const data = await response.json();
            if (response.ok) {
                setMajors(data.majors || []);
            }
        } catch (error) {
            console.error('Error fetching majors:', error);
        }
    };

    // Handle faculty selection
    const handleFacultyChange = (facultyId: string) => {
        setNewStudent({
            ...newStudent,
            facultyId,
            departmentId: '',
            curriculumId: '',
            majorId: ''
        });
        setDepartments([]);
        setCurriculums([]);
        setMajors([]);
        if (facultyId) {
            fetchDepartments(facultyId);
        }
    };

    // Handle department selection
    const handleDepartmentChange = (departmentId: string) => {
        setNewStudent({
            ...newStudent,
            departmentId,
            curriculumId: '',
            majorId: ''
        });
        setCurriculums([]);
        setMajors([]);
        if (departmentId) {
            fetchCurriculums(departmentId);
        }
    };

    // Handle curriculum selection
    const handleCurriculumChange = (curriculumId: string) => {
        setNewStudent({
            ...newStudent,
            curriculumId,
            majorId: ''
        });
        setMajors([]);
        if (curriculumId) {
            fetchMajors(curriculumId);
        }
    };

    // Handle major selection
    const handleMajorChange = (majorId: string) => {
        setNewStudent({
            ...newStudent,
            majorId
        });
    };

    // Handle name field changes with validation
    const handleNameFieldChange = (language: 'thai' | 'english', field: string, value: string) => {
        const fieldKey = `${language}${field.charAt(0).toUpperCase() + field.slice(1)}`;
        setNewStudent({
            ...newStudent,
            [fieldKey]: value
        });
    };

    // Handle validation state changes
    const handleValidationChange = (language: 'thai' | 'english', isValid: boolean) => {
        setFormValidation(prev => {
            const newState = {
                ...prev,
                [`${language}Name`]: isValid
            };

            // ตรวจสอบว่าต้องมีชื่อภาษาใดภาษาหนึ่งที่ถูกต้อง
            const hasValidThaiName = newState.thaiName && newStudent.thaiName.trim() !== '';
            const hasValidEnglishName = newState.englishName && newStudent.englishName.trim() !== '';

            newState.isValid = hasValidThaiName || hasValidEnglishName;

            return newState;
        });
    };

    // Load initial data on component mount
    React.useEffect(() => {
        fetchStudents();
        fetchFaculties();
    }, [searchTerm, currentPage]);

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students.map(student => student.id));
        } else {
            setSelectedStudents([]);
        }
    };



    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = e.target?.result;
                    if (!data) {
                        throw new Error('Could not read file data.');
                    }

                    let processedData;
                    const fileExtension = file.name.toLowerCase().split('.').pop();

                    if (fileExtension === 'csv') {
                        const csvText = data as string;
                        processedData = {
                            action: 'upload',
                            fileType: 'csv',
                            data: csvText
                        };
                    } else {
                        const arrayBuffer = data instanceof ArrayBuffer ? data : new TextEncoder().encode(data as string).buffer;
                        processedData = {
                            action: 'upload',
                            fileType: 'excel',
                            data: Array.from(new Uint8Array(arrayBuffer))
                        };
                    }

                    const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(processedData),
                    });

                    const resultData = await response.json();

                    if (!response.ok) {
                        throw new Error(resultData.message || 'Failed to upload data');
                    }

                    toast({
                        title: 'อัปโหลดสำเร็จ',
                        description: `สร้างใหม่: ${resultData.createdCount} คน, อัปเดต: ${resultData.updatedCount} คน, ข้าม: ${resultData.skippedCount} คน`,
                    });

                    setIsExcelUploadOpen(false);
                    fetchStudents(); // Refresh the list

                } catch (error: any) {
                    toast({
                        variant: 'destructive',
                        title: 'เกิดข้อผิดพลาดในการอัปโหลด',
                        description: error.message || 'ไม่สามารถประมวลผลไฟล์ได้',
                    });
                } finally {
                    setLoading(false);
                }
            };

            const fileExtension = file.name.toLowerCase().split('.').pop();
            if (fileExtension === 'csv') {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsArrayBuffer(file);
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                variant: 'destructive',
                title: 'ข้อผิดพลาด',
                description: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
            });
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        try {
            setLoading(true);

            // Validate required fields
            if (!newStudent.studentId.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: 'กรุณากรอกรหัสนักศึกษา'
                });
                return;
            }

            // ตรวจสอบว่ามีชื่อภาษาอังกฤษหรือไม่ (สำหรับนักศึกษาต่างชาติ)
            const isInternationalStudent = newStudent.englishName.trim() !== '';

            // ตรวจสอบความถูกต้องของฟอร์ม
            if (!formValidation.isValid) {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง'
                });
                return;
            }

            if (!isInternationalStudent && !newStudent.thaiName.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: 'กรุณากรอกชื่อภาษาไทย หรือชื่อภาษาอังกฤษสำหรับนักศึกษาต่างชาติ'
                });
                return;
            }

            if (!isInternationalStudent && !newStudent.thaiSurname.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: 'กรุณากรอกนามสกุลภาษาไทย หรือนามสกุลภาษาอังกฤษสำหรับนักศึกษาต่างชาติ'
                });
                return;
            }

            if (isInternationalStudent && !newStudent.englishSurname.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: 'กรุณากรอกนามสกุลภาษาอังกฤษ'
                });
                return;
            }

            // Generate email if not provided (optional)
            const email = newStudent.email.trim() || `${newStudent.studentId}@student.university.ac.th`;

            // Use default password
            const password = newStudent.password || '12345678';

            const userData = {
                id: newStudent.studentId,
                email: email,
                password: password,
                roles: newStudent.roles,
                // ข้อมูลภาษาไทย
                t_title: newStudent.thaiPrefix || null,
                t_name: newStudent.thaiName || null,
                t_middle_name: newStudent.thaiMiddleName || null,
                t_surname: newStudent.thaiSurname || null,
                // ข้อมูลภาษาอังกฤษ
                e_title: newStudent.englishPrefix || null,
                e_name: newStudent.englishName || null,
                e_middle_name: newStudent.englishMiddleName || null,
                e_surname: newStudent.englishSurname || null,
                // ข้อมูลเพิ่มเติม
                facultyId: newStudent.facultyId || null,
                departmentId: newStudent.departmentId || null,
                curriculumId: newStudent.curriculumId || null,
                majorId: newStudent.majorId || null,
                studentYear: newStudent.studentYear ? parseInt(newStudent.studentYear) : null,
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: 'สำเร็จ',
                    description: 'เพิ่มนักศึกษาใหม่สำเร็จ'
                });

                // Reset form
                setNewStudent({
                    studentId: '',
                    facultyId: '',
                    departmentId: '',
                    curriculumId: '',
                    majorId: '',
                    studentYear: '',
                    thaiPrefix: '',
                    thaiName: '',
                    thaiMiddleName: '',
                    thaiSurname: '',
                    englishPrefix: '',
                    englishName: '',
                    englishMiddleName: '',
                    englishSurname: '',
                    email: '',
                    password: '12345678',
                    roles: ['student']
                });

                setIsAddStudentOpen(false);

                // Refresh the students list
                fetchStudents();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: result.message || 'ไม่สามารถเพิ่มนักศึกษาได้'
                });
            }
        } catch (error) {
            console.error('Error adding student:', error);
            toast({
                variant: 'destructive',
                title: 'ข้อผิดพลาด',
                description: 'เกิดข้อผิดพลาดในการเพิ่มนักศึกษา'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedStudents.length === 0) return;

        if (!confirm(`คุณต้องการลบนักศึกษา ${selectedStudents.length} คนใช่หรือไม่?`)) {
            return;
        }

        try {
            setLoading(true);

            // Extract actual student IDs from the selected format
            const studentIds = selectedStudents.map(selected => {
                const parts = selected.split('-');
                const index = parseInt(parts[parts.length - 1]);
                return students[index]?.id;
            }).filter(Boolean);

            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: studentIds }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: 'สำเร็จ',
                    description: result.message || 'ลบนักศึกษาสำเร็จ'
                });

                setSelectedStudents([]);
                fetchStudents(); // Refresh the list
            } else {
                toast({
                    variant: 'destructive',
                    title: 'ข้อผิดพลาด',
                    description: result.message || 'ไม่สามารถลบนักศึกษาได้'
                });
            }
        } catch (error) {
            console.error('Error deleting students:', error);
            toast({
                variant: 'destructive',
                title: 'ข้อผิดพลาด',
                description: 'เกิดข้อผิดพลาดในการลบนักศึกษา'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (role: string, checked: boolean) => {
        const currentRoles = newStudent.roles;

        if (checked) {
            // Logic for adding roles
            if (role === 'นักศึกษา') {
                // If selecting student, clear all other roles
                setNewStudent({ ...newStudent, roles: ['นักศึกษา'] });
            } else if (role === 'ธุรการ') {
                // If selecting staff, clear all other roles
                setNewStudent({ ...newStudent, roles: ['ธุรการ'] });
            } else {
                // If selecting teacher roles (instructor, supervisor, committee)
                // Remove student and staff if they exist, then add the new role
                const filteredRoles = currentRoles.filter(r => r !== 'นักศึกษา' && r !== 'ธุรการ');
                if (!filteredRoles.includes(role)) {
                    setNewStudent({ ...newStudent, roles: [...filteredRoles, role] });
                }
            }
        } else {
            // Remove the role
            setNewStudent({ ...newStudent, roles: currentRoles.filter(r => r !== role) });
        }
    };

    const isRoleDisabled = (role: string) => {
        const currentRoles = newStudent.roles;

        if (role === 'นักศึกษา') {
            // Student is disabled if any teacher role or staff is selected
            return currentRoles.some(r => ['อาจารย์ประจำสาขาวิชา', 'อาจารย์นิเทศ', 'คณะกรรมการ', 'ธุรการ'].includes(r));
        } else if (role === 'ธุรการ') {
            // Staff is disabled if any other role is selected
            return currentRoles.some(r => r !== 'ธุรการ');
        } else {
            // Teacher roles are disabled if student or staff is selected
            return currentRoles.includes('นักศึกษา') || currentRoles.includes('ธุรการ');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-amber-700">อัปโหลดรายชื่อ</h1>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-amber-700">ค้นหารายชื่อ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="ชื่อ-สกุล, รหัสประจำตัว"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Select defaultValue="all-departments">
                                <SelectTrigger>
                                    <SelectValue placeholder="สำนักงาน" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-departments">กรุณาเลือก</SelectItem>
                                    <SelectItem value="cs">วิทยาการคอมพิวเตอร์</SelectItem>
                                    <SelectItem value="it">เทคโนโลยีสารสนเทศ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-48">
                            <Select defaultValue="all-branches">
                                <SelectTrigger>
                                    <SelectValue placeholder="สาขาวิชา" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-branches">กรุณาเลือก</SelectItem>
                                    <SelectItem value="cs">วิทยาการคอมพิวเตอร์</SelectItem>
                                    <SelectItem value="it">เทคโนโลยีสารสนเทศ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-amber-700">รายชื่อ</div>
                        <div className="flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>

                            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        อัปโหลดรายชื่อ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <div className="flex items-center justify-between">
                                            <DialogTitle className="text-lg font-semibold text-amber-700">
                                                อัปโหลดรายชื่อ
                                            </DialogTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsUploadDialogOpen(false)}
                                                className="h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 gap-4 py-6">
                                        <Button
                                            className="h-16 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-3"
                                            onClick={() => {
                                                setIsUploadDialogOpen(false);
                                                setIsExcelUploadOpen(true);
                                            }}
                                        >
                                            <Upload className="h-5 w-5" />
                                            <span className="font-medium">อัปโหลด Excel</span>
                                        </Button>
                                        <Button
                                            className="h-16 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-3"
                                            onClick={() => {
                                                setIsUploadDialogOpen(false);
                                                setIsAddStudentOpen(true);
                                            }}
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            <span className="font-medium">เพิ่มรายชื่อ</span>
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button className="bg-amber-600 hover:bg-amber-700">
                                <Download className="h-4 w-4 mr-2" />
                                แก้ไข
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteSelected}
                                disabled={selectedStudents.length === 0 || loading}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบ ({selectedStudents.length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-orange-500 text-white">
                                    <th className="p-3 text-left font-medium">
                                        <Checkbox
                                            checked={selectedStudents.length === students.length}
                                            onCheckedChange={handleSelectAll}
                                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-orange-500"
                                        />
                                    </th>
                                    <th className="p-3 text-left font-medium">รหัส</th>
                                    <th className="p-3 text-left font-medium">สาขาวิชา</th>
                                    <th className="p-3 text-left font-medium">สำนักงาน</th>
                                    <th className="p-3 text-left font-medium">ข้อมูลเพิ่มเติม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            ไม่พบข้อมูลนักศึกษา
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student, index) => {
                                        // สร้างชื่อแสดงผล โดยให้ความสำคัญกับภาษาอังกฤษก่อนสำหรับนักศึกษาต่างชาติ
                                        const thaiName = [student.t_title, student.t_name, student.t_middle_name, student.t_surname].filter(Boolean).join(' ');
                                        const englishName = [student.e_title, student.e_name, student.e_middle_name, student.e_surname].filter(Boolean).join(' ');

                                        // ถ้ามีชื่อภาษาอังกฤษแต่ไม่มีชื่อภาษาไทย = นักศึกษาต่างชาติ
                                        const isInternationalStudent = englishName && !thaiName;
                                        const displayName = student.name ||
                                            (isInternationalStudent ? englishName : (thaiName || englishName)) ||
                                            student.id;

                                        const roles = Array.isArray(student.roles) ? student.roles : [];
                                        const baseRoleDisplay = roles.includes('student') ? 'นักศึกษา' : roles.join(', ');
                                        const roleDisplay = isInternationalStudent ? `${baseRoleDisplay} (ต่างชาติ)` : baseRoleDisplay;

                                        return (
                                            <tr key={`${student.id}-${index}`} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <Checkbox
                                                        checked={selectedStudents.includes(`${student.id}-${index}`)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectStudent(`${student.id}-${index}`, checked as boolean)
                                                        }
                                                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <div className="font-medium">{displayName}</div>
                                                        {!isInternationalStudent && englishName && (
                                                            <div className="text-sm text-gray-600">{englishName}</div>
                                                        )}
                                                        {isInternationalStudent && thaiName && (
                                                            <div className="text-sm text-gray-600">{thaiName}</div>
                                                        )}
                                                        <div className="text-sm text-gray-500">{student.id}</div>
                                                        {student.email && (
                                                            <div className="text-xs text-gray-400">{student.email}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        {student.major?.nameTh || 'ไม่ระบุ'}
                                                        {student.major?.nameEn && (
                                                            <div className="text-xs text-gray-500">{student.major.nameEn}</div>
                                                        )}
                                                        {student.major?.curriculum?.nameTh && (
                                                            <div className="text-xs text-gray-400">หลักสูตร: {student.major.curriculum.nameTh}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        {student.department?.nameTh || student.major?.curriculum?.department?.nameTh || 'ไม่ระบุ'}
                                                        {(student.department?.nameEn || student.major?.curriculum?.department?.nameEn) && (
                                                            <div className="text-xs text-gray-500">
                                                                {student.department?.nameEn || student.major?.curriculum?.department?.nameEn}
                                                            </div>
                                                        )}
                                                        {(student.faculty?.nameTh || student.major?.curriculum?.department?.faculty?.nameTh) && (
                                                            <div className="text-xs text-gray-400">
                                                                คณะ: {student.faculty?.nameTh || student.major?.curriculum?.department?.faculty?.nameTh}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className={`${isInternationalStudent ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                                                            {roleDisplay}
                                                        </Badge>
                                                        {student.studentYear && (
                                                            <Badge variant="outline" className="text-xs">
                                                                ปี {student.studentYear}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                                        ดูรายละเอียด
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    หน้า {currentPage} / {totalPages} (รวม {totalStudents} คน)
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Excel Upload Dialog */}
            <Dialog open={isExcelUploadOpen} onOpenChange={setIsExcelUploadOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-lg font-semibold text-amber-700">
                                อัปโหลดไฟล์ Excel/CSV
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExcelUploadOpen(false)}
                                className="h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">เลือกไฟล์ Excel หรือ CSV</p>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload">
                                <Button className="bg-amber-600 hover:bg-amber-700" asChild>
                                    <span>เลือกไฟล์</span>
                                </Button>
                            </label>
                        </div>
                        <div className="text-sm text-gray-500 space-y-2">
                            <p>รองรับไฟล์: .xlsx, .xls, .csv</p>
                            <p>ขนาดไฟล์สูงสุด: 10MB</p>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-medium text-blue-800 mb-2">สำหรับนักศึกษาต่างชาติ:</p>
                                <p className="text-blue-700 text-xs">
                                    • กรอกเฉพาะข้อมูลภาษาอังกฤษ (e_title, e_name, e_surname)<br />
                                    • ไม่จำเป็นต้องกรอกข้อมูลภาษาไทย<br />
                                    • ระบบจะจดจำสถานะนักศึกษาต่างชาติอัตโนมัติ
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Student Dialog */}
            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogContent className="sm:max-w-6xl max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-lg font-semibold text-amber-700">
                                อัปโหลดรายชื่อ
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsAddStudentOpen(false)}
                                className="h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Student ID and Basic Info Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <ValidatedInput
                                    label="รหัสนักศึกษา"
                                    type="numbers"
                                    placeholder="รหัสนักศึกษา"
                                    required={true}
                                    minLength={8}
                                    maxLength={12}
                                    value={newStudent.studentId}
                                    onChange={(value) => setNewStudent({ ...newStudent, studentId: value })}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                    ชั้นปี
                                </Label>
                                <Select
                                    value={newStudent.studentYear}
                                    onValueChange={(value) => setNewStudent({ ...newStudent, studentYear: value })}
                                >
                                    <SelectTrigger className="text-base">
                                        <SelectValue placeholder="เลือกชั้นปี" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">ปี 1</SelectItem>
                                        <SelectItem value="2">ปี 2</SelectItem>
                                        <SelectItem value="3">ปี 3</SelectItem>
                                        <SelectItem value="4">ปี 4</SelectItem>
                                        <SelectItem value="5">ปี 5</SelectItem>
                                        <SelectItem value="6">ปี 6</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                    คณะ
                                </Label>
                                <Select
                                    value={newStudent.facultyId}
                                    onValueChange={handleFacultyChange}
                                >
                                    <SelectTrigger className="text-base">
                                        <SelectValue placeholder="เลือกคณะ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map((faculty) => (
                                            <SelectItem key={faculty.id} value={faculty.id}>
                                                {faculty.nameTh} {faculty.nameEn && `(${faculty.nameEn})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Department and Curriculum Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                    ภาควิชา
                                </Label>
                                <Select
                                    value={newStudent.departmentId}
                                    onValueChange={handleDepartmentChange}
                                    disabled={!newStudent.facultyId}
                                >
                                    <SelectTrigger className="text-base">
                                        <SelectValue placeholder={newStudent.facultyId ? "เลือกภาควิชา" : "เลือกคณะก่อน"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.nameTh} {dept.nameEn && `(${dept.nameEn})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                    หลักสูตร
                                </Label>
                                <Select
                                    value={newStudent.curriculumId}
                                    onValueChange={handleCurriculumChange}
                                    disabled={!newStudent.departmentId}
                                >
                                    <SelectTrigger className="text-base">
                                        <SelectValue placeholder={newStudent.departmentId ? "เลือกหลักสูตร" : "เลือกภาควิชาก่อน"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {curriculums.map((curriculum) => (
                                            <SelectItem key={curriculum.id} value={curriculum.id}>
                                                {curriculum.nameTh} {curriculum.nameEn && `(${curriculum.nameEn})`}
                                                {curriculum.degree && ` - ${curriculum.degree}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Major Row */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                    สาขาวิชา
                                </Label>
                                <Select
                                    value={newStudent.majorId}
                                    onValueChange={handleMajorChange}
                                    disabled={!newStudent.curriculumId}
                                >
                                    <SelectTrigger className="text-base">
                                        <SelectValue placeholder={newStudent.curriculumId ? "เลือกสาขาวิชา" : "เลือกหลักสูตรก่อน"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {majors.map((major) => (
                                            <SelectItem key={major.id} value={major.id}>
                                                {major.nameTh} {major.nameEn && `(${major.nameEn})`}
                                                {major.area && ` - ${major.area}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Thai Name Row */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold text-amber-700 block">
                                    ชื่อ-นามสกุล (ภาษาไทย)
                                </Label>
                                {newStudent.englishName.trim() && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                        นักศึกษาต่างชาติ - ไม่จำเป็นต้องกรอกภาษาไทย
                                    </Badge>
                                )}
                            </div>
                            <NameInputGroup
                                language="thai"
                                values={{
                                    prefix: newStudent.thaiPrefix,
                                    name: newStudent.thaiName,
                                    middleName: newStudent.thaiMiddleName,
                                    surname: newStudent.thaiSurname
                                }}
                                onChange={(field, value) => handleNameFieldChange('thai', field, value)}
                                onValidationChange={(isValid) => handleValidationChange('thai', isValid)}
                                prefixOptions={thaiPrefixes}
                                required={!newStudent.englishName.trim()}
                                disabled={loading}
                            />
                        </div>

                        {/* English Name Row */}
                        <div className="space-y-3">
                            <Label className="text-lg font-semibold text-amber-700 block">
                                ชื่อ-นามสกุล (ภาษาอังกฤษ)
                            </Label>
                            <NameInputGroup
                                language="english"
                                values={{
                                    prefix: newStudent.englishPrefix,
                                    name: newStudent.englishName,
                                    middleName: newStudent.englishMiddleName,
                                    surname: newStudent.englishSurname
                                }}
                                onChange={(field, value) => handleNameFieldChange('english', field, value)}
                                onValidationChange={(isValid) => handleValidationChange('english', isValid)}
                                prefixOptions={englishPrefixes}
                                required={!newStudent.thaiName.trim()}
                                disabled={loading}
                            />
                        </div>

                        {/* Email and Password Row */}
                        <div className="space-y-3">
                            <Label className="text-lg font-semibold text-amber-700 block">
                                ข้อมูลเข้าสู่ระบบ
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                        อีเมล (ไม่บังคับ - จะสร้างอัตโนมัติ)
                                    </Label>
                                    <Input
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        placeholder="student@university.ac.th"
                                        className="text-base"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                        รหัสผ่าน (ค่าเริ่มต้น: 12345678)
                                    </Label>
                                    <Input
                                        type="text"
                                        value={newStudent.password}
                                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                        placeholder="12345678"
                                        className="text-base"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        นักศึกษาสามารถเปลี่ยนรหัสผ่านได้ภายหลัง
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Role Selection with Checkboxes */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="student"
                                    checked={newStudent.roles.includes('นักศึกษา')}
                                    onCheckedChange={(checked) => handleRoleChange('นักศึกษา', checked as boolean)}
                                    disabled={isRoleDisabled('นักศึกษา')}
                                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                                        นักศึกษา
                                    </span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="instructor"
                                    checked={newStudent.roles.includes('อาจารย์ประจำสาขาวิชา')}
                                    onCheckedChange={(checked) => handleRoleChange('อาจารย์ประจำสาขาวิชา', checked as boolean)}
                                    disabled={isRoleDisabled('อาจารย์ประจำสาขาวิชา')}
                                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label htmlFor="instructor" className="flex items-center gap-2 cursor-pointer">
                                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                                        อาจารย์ประจำสาขาวิชา
                                    </span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="supervisor"
                                    checked={newStudent.roles.includes('อาจารย์นิเทศ')}
                                    onCheckedChange={(checked) => handleRoleChange('อาจารย์นิเทศ', checked as boolean)}
                                    disabled={isRoleDisabled('อาจารย์นิเทศ')}
                                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label htmlFor="supervisor" className="flex items-center gap-2 cursor-pointer">
                                    <span className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm">
                                        อาจารย์นิเทศ
                                    </span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="committee"
                                    checked={newStudent.roles.includes('คณะกรรมการ')}
                                    onCheckedChange={(checked) => handleRoleChange('คณะกรรมการ', checked as boolean)}
                                    disabled={isRoleDisabled('คณะกรรมการ')}
                                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label htmlFor="committee" className="flex items-center gap-2 cursor-pointer">
                                    <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                                        คณะกรรมการ
                                    </span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="staff"
                                    checked={newStudent.roles.includes('ธุรการ')}
                                    onCheckedChange={(checked) => handleRoleChange('ธุรการ', checked as boolean)}
                                    disabled={isRoleDisabled('ธุรการ')}
                                    className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label htmlFor="staff" className="flex items-center gap-2 cursor-pointer">
                                    <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                                        ธุรการ
                                    </span>
                                </Label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleAddStudent}
                                className="bg-amber-600 hover:bg-amber-700 px-8"
                            >
                                บันทึก
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}