import type { VisitorInterface } from './type';
import type { VisitorFilterParams } from './index';

// Client-side filtering implementation
export const applyClientSideFiltering = (data: VisitorInterface[], filterParams: VisitorFilterParams): VisitorInterface[] => {
  let filteredData = [...data];

  // Apply search filter
  if (filterParams.search) {
    const searchTerm = filterParams.search.toLowerCase();
    filteredData = filteredData.filter(visitor => {
      const student = visitor.studentEnroll?.student;
      const training = visitor.studentEnroll?.student_training;
      
      const fullName = student ? `${student.name} ${student.surname}`.toLowerCase() : '';
      const studentCode = (student?.studentId || '').toLowerCase();
      const companyName = (training?.company?.companyNameTh || '').toLowerCase();
      
      return fullName.includes(searchTerm) || 
             studentCode.includes(searchTerm) || 
             companyName.includes(searchTerm);
    });
  }

  // Apply position filter
  if (filterParams.position) {
    filteredData = filteredData.filter(visitor => {
      const position = visitor.studentEnroll?.student_training?.position || '';
      return position.toLowerCase().includes(filterParams.position!.toLowerCase());
    });
  }

  // Apply company filter
  if (filterParams.company) {
    filteredData = filteredData.filter(visitor => {
      const companyName = visitor.studentEnroll?.student_training?.company?.companyNameTh || '';
      return companyName.toLowerCase().includes(filterParams.company!.toLowerCase());
    });
  }

  // Apply department filter
  if (filterParams.department) {
    filteredData = filteredData.filter(visitor => {
      const department = visitor.studentEnroll?.student_training?.department || '';
      return department.toLowerCase().includes(filterParams.department!.toLowerCase());
    });
  }

  // Apply appointment status filter
  if (filterParams.appointmentStatus) {
    filteredData = filteredData.filter(visitor => {
      const hasSchedules = visitor.schedules && visitor.schedules.length > 0;
      const now = new Date();
      
      let status = 'รอนัดหมาย';
      if (hasSchedules) {
        const completedVisits = visitor.schedules.filter(schedule => 
          new Date(schedule.visitAt) <= now
        ).length;
        const totalVisits = visitor.schedules.length;
        
        if (completedVisits === totalVisits && totalVisits > 0) {
          status = 'เสร็จสิ้น';
        } else {
          status = 'นัดหมายแล้ว';
        }
      }
      
      return status === filterParams.appointmentStatus;
    });
  }

  // Apply sorting
  if (filterParams.sortBy) {
    filteredData.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (filterParams.sortBy) {
        case 'name':
          aValue = `${a.studentEnroll?.student?.name || ''} ${a.studentEnroll?.student?.surname || ''}`;
          bValue = `${b.studentEnroll?.student?.name || ''} ${b.studentEnroll?.student?.surname || ''}`;
          break;
        case 'studentCode':
          aValue = a.studentEnroll?.student?.studentId || '';
          bValue = b.studentEnroll?.student?.studentId || '';
          break;
        case 'companyName':
          aValue = a.studentEnroll?.student_training?.company?.companyNameTh || '';
          bValue = b.studentEnroll?.student_training?.company?.companyNameTh || '';
          break;
        case 'appointmentCount':
          aValue = a.schedules?.length || 0;
          bValue = b.schedules?.length || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return filterParams.sortOrder === 'desc' ? -comparison : comparison;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'th');
        return filterParams.sortOrder === 'desc' ? -comparison : comparison;
      }
      
      return 0;
    });
  }

  // Apply pagination if specified
  if (filterParams.limit || filterParams.offset) {
    const offset = filterParams.offset || 0;
    const limit = filterParams.limit || filteredData.length;
    filteredData = filteredData.slice(offset, offset + limit);
  }

  return filteredData;
};
