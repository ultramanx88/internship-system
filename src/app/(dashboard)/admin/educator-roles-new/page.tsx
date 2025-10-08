'use client';

import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { EducatorRoleManagement } from '@/components/educator-role-management';
import { useEducatorRoleManagement } from '@/hooks/use-educator-role-management';
import { useToast } from '@/hooks/use-toast';

export default function AdminEducatorRolesNewPage() {
  const { toast } = useToast();
  const {
    assignments,
    educators,
    academicYears,
    semesters,
    roleOptions,
    loading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    openForm,
    closeForm,
    isFormOpen,
    selectedAssignment,
    isEditing
  } = useEducatorRoleManagement();

  const handleAssignmentCreate = (assignment: any) => {
    console.log('Assignment created:', assignment);
  };

  const handleAssignmentUpdate = (assignment: any) => {
    console.log('Assignment updated:', assignment);
  };

  const handleAssignmentDelete = (id: string) => {
    console.log('Assignment deleted:', id);
  };

  const handleError = (error: string) => {
    toast({
      variant: 'destructive',
      title: 'เกิดข้อผิดพลาด',
      description: error
    });
  };

  return (
    <PermissionGuard requiredRoles={['admin']}>
      <div className="container mx-auto p-6">
        <EducatorRoleManagement
          assignments={assignments}
          educators={educators}
          academicYears={academicYears}
          semesters={semesters}
          onAssignmentCreate={handleAssignmentCreate}
          onAssignmentUpdate={handleAssignmentUpdate}
          onAssignmentDelete={handleAssignmentDelete}
          onError={handleError}
          readOnly={false}
          showCreateButton={true}
          showEditButton={true}
          showDeleteButton={true}
        />
      </div>
    </PermissionGuard>
  );
}
