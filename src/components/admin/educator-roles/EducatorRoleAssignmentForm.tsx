'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Educator {
  id: string;
  name: string;
  email: string;
  t_name?: string;
  t_surname?: string;
  e_name?: string;
  e_surname?: string;
}

interface AcademicYear {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

interface EducatorRoleAssignment {
  id: string;
  educatorId: string;
  academicYearId: string;
  semesterId: string;
  roles: string[];
  isActive: boolean;
  notes?: string;
  educator: Educator;
  academicYear: AcademicYear;
  semester: Semester;
}

interface EducatorRoleAssignmentFormProps {
  assignment?: EducatorRoleAssignment | null;
  educators: Educator[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ROLE_OPTIONS = [
  { value: 'educator', label: 'อาจารย์', description: 'บทบาทหลักของอาจารย์ในระบบ' },
  { value: 'courseInstructor', label: 'อาจารย์ประจำวิชา', description: 'รับผิดชอบการสอนและประเมินผล' },
  { value: 'supervisor', label: 'อาจารย์นิเทศก์', description: 'ดูแลและให้คำแนะนำนักศึกษา' },
  { value: 'committee', label: 'กรรมการ', description: 'พิจารณาและอนุมัติใบสมัคร' },
  { value: 'visitor', label: 'ผู้เยี่ยมชม', description: 'เยี่ยมชมและประเมินสถานประกอบการ' }
];

export function EducatorRoleAssignmentForm({
  assignment,
  educators,
  academicYears,
  semesters,
  onSuccess,
  onCancel
}: EducatorRoleAssignmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    educatorId: '',
    academicYearId: '',
    semesterId: '',
    role: '', // Changed from roles array to single role
    isActive: true,
    notes: ''
  });

  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    if (assignment) {
      setFormData({
        educatorId: assignment.educatorId,
        academicYearId: assignment.academicYearId,
        semesterId: assignment.semesterId,
        role: assignment.roles.length > 0 ? assignment.roles[0] : '', // Take first role for single-role
        isActive: assignment.isActive,
        notes: assignment.notes || ''
      });
    }
  }, [assignment]);

  useEffect(() => {
    if (formData.academicYearId) {
      const filtered = semesters.filter(semester => 
        semester.academicYearId === formData.academicYearId
      );
      setFilteredSemesters(filtered);
      
      // Reset semester if it's not available in the filtered list
      if (formData.semesterId && !filtered.find(s => s.id === formData.semesterId)) {
        setFormData(prev => ({ ...prev, semesterId: '' }));
      }
    } else {
      setFilteredSemesters([]);
    }
  }, [formData.academicYearId, semesters]);

  // Debug effect to log data changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Form data changed:', formData);
      console.log('Academic years available:', academicYears);
      console.log('Semesters available:', semesters);
      console.log('Filtered semesters:', filteredSemesters);
    }
  }, [formData, academicYears, semesters, filteredSemesters]);

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.educatorId || !formData.academicYearId || !formData.semesterId) {
      toast({
        variant: 'destructive',
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
      return;
    }

    if (!formData.role) {
      toast({
        variant: 'destructive',
        title: 'ต้องเลือกบทบาท',
        description: 'กรุณาเลือกบทบาท'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = assignment 
        ? `/api/educator-role-assignments/${assignment.id}`
        : '/api/educator-role-assignments';
      
      const method = assignment ? 'PUT' : 'POST';

      const requestBody = assignment 
        ? {
            roles: [formData.role], // Convert single role to array for API compatibility
            isActive: formData.isActive,
            notes: formData.notes
          }
        : {
            ...formData,
            roles: [formData.role] // Convert single role to array for API compatibility
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: assignment ? 'อัปเดตสำเร็จ' : 'สร้างสำเร็จ',
          description: data.message
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถบันทึกข้อมูลได้'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEducatorName = (educator: Educator) => {
    if (educator.t_name && educator.t_surname) {
      return `${educator.t_name} ${educator.t_surname}`;
    }
    if (educator.e_name && educator.e_surname) {
      return `${educator.e_name} ${educator.e_surname}`;
    }
    return educator.name;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'แก้ไขการกำหนดบทบาท' : 'เพิ่มการกำหนดบทบาทใหม่'}
          </DialogTitle>
          <DialogDescription>
            กำหนดบทบาทให้ educator ในเทอมและปีการศึกษาที่เลือก
          </DialogDescription>
        </DialogHeader>
        
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
            <div>Academic Years: {academicYears.length}</div>
            <div>Semesters: {semesters.length}</div>
            <div>Filtered Semesters: {filteredSemesters.length}</div>
            <div>Selected Academic Year: {formData.academicYearId}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Educator Selection */}
            <div className="space-y-2">
              <Label htmlFor="educatorId">Educator *</Label>
              <select
                id="educatorId"
                value={formData.educatorId}
                onChange={(e) => setFormData(prev => ({ ...prev, educatorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">เลือก Educator</option>
                {educators.map((educator) => (
                  <option key={educator.id} value={educator.id}>
                    {getEducatorName(educator)} ({educator.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="academicYearId">ปีการศึกษา *</Label>
              <select
                id="academicYearId"
                value={formData.academicYearId}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  academicYearId: e.target.value,
                  semesterId: '' // Reset semester when year changes
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">เลือกปีการศึกษา</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semesterId">ภาคเรียน *</Label>
              <select
                id="semesterId"
                value={formData.semesterId}
                onChange={(e) => setFormData(prev => ({ ...prev, semesterId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.academicYearId}
              >
                <option value="">
                  {!formData.academicYearId 
                    ? 'กรุณาเลือกปีการศึกษาก่อน' 
                    : filteredSemesters.length === 0 
                      ? 'ไม่พบภาคเรียนสำหรับปีการศึกษานี้' 
                      : 'เลือกภาคเรียน'
                  }
                </option>
                {filteredSemesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                  }
                />
                <Label htmlFor="isActive" className="text-sm">
                  ใช้งาน
                </Label>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>บทบาท *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((role) => (
                <div key={role.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <input
                    type="radio"
                    id={role.value}
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={role.value} className="font-medium cursor-pointer">
                      {role.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'กำลังบันทึก...' : (assignment ? 'อัปเดต' : 'สร้าง')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
