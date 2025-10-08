'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  EducatorRoleAssignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  Educator,
  AcademicYear,
  Semester,
  RoleOption
} from '@/lib/educator-role-management';
import { EducatorRoleValidator } from '@/lib/educator-role-management/validation';

interface EducatorRoleAssignmentFormProps {
  assignment?: EducatorRoleAssignment | null;
  educators: Educator[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  roleOptions: RoleOption[];
  onSuccess: (assignment: EducatorRoleAssignment) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EducatorRoleAssignmentForm({
  assignment,
  educators,
  academicYears,
  semesters,
  roleOptions,
  onSuccess,
  onCancel,
  isLoading = false
}: EducatorRoleAssignmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAssignmentData>({
    educatorId: '',
    academicYearId: '',
    semesterId: '',
    roles: [],
    isActive: true,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);

  // Initialize form data
  useEffect(() => {
    if (assignment) {
      setFormData({
        educatorId: assignment.educatorId,
        academicYearId: assignment.academicYearId,
        semesterId: assignment.semesterId,
        roles: [...assignment.roles],
        isActive: assignment.isActive,
        notes: assignment.notes || ''
      });
    } else {
      setFormData({
        educatorId: '',
        academicYearId: '',
        semesterId: '',
        roles: [],
        isActive: true,
        notes: ''
      });
    }
    setErrors({});
  }, [assignment]);

  // Filter semesters based on selected academic year
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
      setFilteredSemesters(semesters);
    }
  }, [formData.academicYearId, semesters, formData.semesterId]);

  const handleInputChange = (field: keyof CreateAssignmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
    
    // Clear roles error
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validation = assignment 
      ? EducatorRoleValidator.validateUpdateAssignment({ ...formData, id: assignment.id })
      : EducatorRoleValidator.validateCreateAssignment(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock assignment for success
      const mockAssignment: EducatorRoleAssignment = {
        id: assignment?.id || `assignment-${Date.now()}`,
        educatorId: formData.educatorId,
        academicYearId: formData.academicYearId,
        semesterId: formData.semesterId,
        roles: formData.roles,
        isActive: formData.isActive,
        notes: formData.notes,
        createdAt: assignment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        educator: educators.find(e => e.id === formData.educatorId)!,
        academicYear: academicYears.find(y => y.id === formData.academicYearId)!,
        semester: semesters.find(s => s.id === formData.semesterId)!
      };

      onSuccess(mockAssignment);
      
      toast({
        title: assignment ? 'อัปเดตสำเร็จ' : 'สร้างสำเร็จ',
        description: `การกำหนดบทบาท${assignment ? 'อัปเดต' : 'สร้าง'}เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEducatorName = (educator: Educator): string => {
    if (educator.t_name && educator.t_surname) {
      return `${educator.t_name} ${educator.t_surname}`;
    }
    if (educator.e_name && educator.e_surname) {
      return `${educator.e_name} ${educator.e_surname}`;
    }
    return educator.name;
  };

  const hasError = (field: string): boolean => {
    return !!errors[field];
  };

  const getError = (field: string): string => {
    return errors[field] || '';
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Educator Selection */}
          <div className="space-y-2">
            <Label htmlFor="educatorId">Educator *</Label>
            <Select
              value={formData.educatorId}
              onValueChange={(value) => handleInputChange('educatorId', value)}
            >
              <SelectTrigger className={hasError('educatorId') ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือก Educator" />
              </SelectTrigger>
              <SelectContent>
                {educators.map((educator) => (
                  <SelectItem key={educator.id} value={educator.id}>
                    {getEducatorName(educator)} ({educator.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError('educatorId') && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getError('educatorId')}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Academic Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="academicYearId">ปีการศึกษา *</Label>
              <Select
                value={formData.academicYearId}
                onValueChange={(value) => handleInputChange('academicYearId', value)}
              >
                <SelectTrigger className={hasError('academicYearId') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError('academicYearId') && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{getError('academicYearId')}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semesterId">ภาคเรียน *</Label>
              <Select
                value={formData.semesterId}
                onValueChange={(value) => handleInputChange('semesterId', value)}
                disabled={!formData.academicYearId}
              >
                <SelectTrigger className={hasError('semesterId') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="เลือกภาคเรียน" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSemesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError('semesterId') && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{getError('semesterId')}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>บทบาท *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map((role) => (
                <div key={role.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={role.value}
                    checked={formData.roles.includes(role.value)}
                    onCheckedChange={(checked) => handleRoleChange(role.value, checked as boolean)}
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
            {hasError('roles') && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getError('roles')}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-sm">
              ใช้งาน
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              rows={3}
              className={hasError('notes') ? 'border-red-500' : ''}
            />
            {hasError('notes') && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getError('notes')}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                assignment ? 'อัปเดต' : 'สร้าง'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
