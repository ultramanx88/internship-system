/**
 * Custom hook for Educator Role Management
 * Hook สำหรับจัดการสถานะการทำงานของระบบจัดการบทบาท Educator
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  EducatorRoleAssignment,
  Educator,
  AcademicYear,
  Semester,
  RoleOption,
  AssignmentFilters,
  PaginationParams,
  CreateAssignmentData,
  UpdateAssignmentData,
  EducatorRoleManagementState,
  EducatorRoleManagementActions
} from '@/lib/educator-role-management';
import { EducatorRoleAssignmentManager } from '@/lib/educator-role-management/role-assignment-manager';
import { createEmptyFilters, createEmptyPagination } from '@/lib/educator-role-management/utils';

export function useEducatorRoleManagement() {
  // State
  const [state, setState] = useState<EducatorRoleManagementState>({
    assignments: [],
    educators: [],
    academicYears: [],
    semesters: [],
    roleOptions: [],
    loading: false,
    error: null,
    selectedAssignment: null,
    filters: createEmptyFilters(),
    pagination: createEmptyPagination(),
    isFormOpen: false,
    isEditing: false,
    formData: {}
  });

  // Initialize manager
  const manager = new EducatorRoleAssignmentManager();

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await manager.loadAllData();
      const data = manager.getCurrentData();
      
      setState(prev => ({
        ...prev,
        assignments: data.assignments,
        educators: data.educators,
        academicYears: data.academicYears,
        semesters: data.semesters,
        roleOptions: data.roleOptions,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // Load assignments
  const loadAssignments = useCallback(async (filters?: AssignmentFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const assignments = await manager.loadAssignments(filters, state.pagination);
      
      setState(prev => ({
        ...prev,
        assignments,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [state.pagination]);

  // Load educators
  const loadEducators = useCallback(async () => {
    try {
      const educators = await manager.loadEducators();
      setState(prev => ({ ...prev, educators }));
    } catch (error) {
      console.error('Error loading educators:', error);
    }
  }, []);

  // Load academic years
  const loadAcademicYears = useCallback(async () => {
    try {
      const academicYears = await manager.loadAcademicYears();
      setState(prev => ({ ...prev, academicYears }));
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  }, []);

  // Load semesters
  const loadSemesters = useCallback(async (academicYearId?: string) => {
    try {
      const semesters = await manager.loadSemesters(academicYearId);
      setState(prev => ({ ...prev, semesters }));
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, []);

  // Load role options
  const loadRoleOptions = useCallback(async () => {
    try {
      const roleOptions = await manager.loadRoleOptions();
      setState(prev => ({ ...prev, roleOptions }));
    } catch (error) {
      console.error('Error loading role options:', error);
    }
  }, []);

  // Create assignment
  const createAssignment = useCallback(async (data: CreateAssignmentData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newAssignment = await manager.createAssignment(data);
      
      setState(prev => ({
        ...prev,
        assignments: [newAssignment, ...prev.assignments],
        loading: false
      }));
      
      return { success: true, assignment: newAssignment };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update assignment
  const updateAssignment = useCallback(async (data: UpdateAssignmentData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedAssignment = await manager.updateAssignment(data);
      
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a => 
          a.id === updatedAssignment.id ? updatedAssignment : a
        ),
        loading: false
      }));
      
      return { success: true, assignment: updatedAssignment };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดต';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete assignment
  const deleteAssignment = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await manager.deleteAssignment(id);
      
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.filter(a => a.id !== id),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบ';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // UI Management
  const setSelectedAssignment = useCallback((assignment: EducatorRoleAssignment | null) => {
    setState(prev => ({ ...prev, selectedAssignment: assignment }));
  }, []);

  const openForm = useCallback((assignment?: EducatorRoleAssignment) => {
    setState(prev => ({
      ...prev,
      isFormOpen: true,
      isEditing: !!assignment,
      selectedAssignment: assignment || null,
      formData: assignment ? {
        educatorId: assignment.educatorId,
        academicYearId: assignment.academicYearId,
        semesterId: assignment.semesterId,
        roles: assignment.roles,
        isActive: assignment.isActive,
        notes: assignment.notes || ''
      } : {}
    }));
  }, []);

  const closeForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFormOpen: false,
      isEditing: false,
      selectedAssignment: null,
      formData: {}
    }));
  }, []);

  const setFilters = useCallback((filters: Partial<AssignmentFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  }, []);

  const setPagination = useCallback((pagination: Partial<PaginationParams>) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...pagination }
    }));
  }, []);

  // Form Management
  const setFormData = useCallback((data: Partial<CreateAssignmentData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {}
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const { formData } = state;
    
    if (!formData.educatorId || !formData.academicYearId || !formData.semesterId) {
      return false;
    }
    
    if (!formData.roles || formData.roles.length === 0) {
      return false;
    }
    
    return true;
  }, [state.formData]);

  // Search and filter
  const searchAssignments = useCallback((query: string) => {
    const filtered = manager.searchAssignments(query);
    setState(prev => ({ ...prev, assignments: filtered }));
  }, []);

  const filterAssignments = useCallback((filters: AssignmentFilters) => {
    const filtered = manager.filterAssignments(filters);
    setState(prev => ({ ...prev, assignments: filtered }));
  }, []);

  // Sort assignments
  const sortAssignments = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sorted = manager.sortAssignments(state.assignments, sortBy, sortOrder);
    setState(prev => ({ ...prev, assignments: sorted }));
  }, [state.assignments]);

  // Paginate assignments
  const paginateAssignments = useCallback((page: number, limit: number) => {
    const paginated = manager.paginateAssignments(state.assignments, page, limit);
    setState(prev => ({ ...prev, assignments: paginated.data }));
  }, [state.assignments]);

  // Get filtered assignments
  const getFilteredAssignments = useCallback(() => {
    return manager.filterAssignments(state.filters);
  }, [state.filters]);

  // Get assignment by ID
  const getAssignmentById = useCallback((id: string) => {
    return manager.getAssignmentById(id);
  }, []);

  // Get assignments by educator
  const getAssignmentsByEducator = useCallback((educatorId: string) => {
    return manager.getAssignmentsByEducator(educatorId);
  }, []);

  // Get assignments by academic year
  const getAssignmentsByAcademicYear = useCallback((academicYearId: string) => {
    return manager.getAssignmentsByAcademicYear(academicYearId);
  }, []);

  // Get assignments by semester
  const getAssignmentsBySemester = useCallback((semesterId: string) => {
    return manager.getAssignmentsBySemester(semesterId);
  }, []);

  // Check if assignment exists
  const hasAssignment = useCallback((educatorId: string, academicYearId: string, semesterId: string) => {
    return manager.hasAssignment(educatorId, academicYearId, semesterId);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    manager.reset();
    setState({
      assignments: [],
      educators: [],
      academicYears: [],
      semesters: [],
      roleOptions: [],
      loading: false,
      error: null,
      selectedAssignment: null,
      filters: createEmptyFilters(),
      pagination: createEmptyPagination(),
      isFormOpen: false,
      isEditing: false,
      formData: {}
    });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Actions object
  const actions: EducatorRoleManagementActions = {
    loadAssignments,
    loadEducators,
    loadAcademicYears,
    loadSemesters,
    loadRoleOptions,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    setSelectedAssignment,
    openForm,
    closeForm,
    setFilters,
    setPagination,
    setFormData,
    resetForm,
    validateForm
  };

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Additional utilities
    searchAssignments,
    filterAssignments,
    sortAssignments,
    paginateAssignments,
    getFilteredAssignments,
    getAssignmentById,
    getAssignmentsByEducator,
    getAssignmentsByAcademicYear,
    getAssignmentsBySemester,
    hasAssignment,
    reset
  };
}
