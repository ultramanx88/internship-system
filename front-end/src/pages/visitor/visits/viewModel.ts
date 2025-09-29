import { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitorService, type VisitorFilterParams } from '../../../service/api/visitor';
import type { VisitorInterface } from '../../../service/api/visitor/type';
import type { ScheduleDisplayData } from '../../../utils/dataTransformation';
import { transformVisitorToScheduleData } from '../../../utils/dataTransformation';
import { classifyError, type EnhancedError } from '../../../utils/errorHandling';
import { useDataSynchronization } from '../../../utils/realTimeSynchronization';
import { useFilterState } from '../../../utils/filterStateManager';
import { retryApiCall } from '../../../utils/retryMechanism';

// ViewModel for the visitor visits page
export const useVisitorVisitsViewModel = () => {
  const visitorService = new VisitorService();
  const { lastUpdateTime, subscribeToUpdates } = useDataSynchronization('visitor-visits');

  // State management
  const [visitors, setVisitors] = useState<VisitorInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EnhancedError | null>(null);

  // Filter state management
  const { filters, applyFilters, resetFilters } = useFilterState<VisitorFilterParams>({
    defaultFilters: {
      search: '',
      position: '',
      major: '',
      appointmentStatus: '',
      department: '',
      company: '',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    persistToUrl: true,
    urlParamPrefix: 'vv'
  });

  // Data fetching and processing
  const fetchVisitors = useCallback(async (currentFilters: VisitorFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      // Use retry mechanism for fetching data
      const response = await retryApiCall(() => visitorService.reqGetVisitor(currentFilters));
      setVisitors(response);
    } catch (err: any) {
      const classifiedError = classifyError(err);
      setError(classifiedError);
      console.error("Failed to fetch visitors:", classifiedError);
    } finally {
      setLoading(false);
    }
  }, [visitorService]);

  // Initial data fetch and re-fetch on filter changes
  useEffect(() => {
    fetchVisitors(filters);
  }, [filters, fetchVisitors]);

  // Subscribe to cross-component updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      fetchVisitors(filters);
    });
    return unsubscribe;
  }, [subscribeToUpdates, fetchVisitors, filters]);

  // Transform data for display
  const displayData: ScheduleDisplayData[] = useMemo(() => {
    try {
      return visitors.map(transformVisitorToScheduleData);
    } catch (err) {
      console.error("Error transforming visitor data:", err);
      setError(classifyError(err));
      return [];
    }
  }, [visitors]);

  // Grouping data by major for display
  const groupedData = useMemo(() => {
    // This part is not fully implemented in the provided code, but here's a placeholder
    // In a real scenario, we would need to access major from student data
    return displayData.reduce((acc, item) => {
      const major = 'ไม่ระบุสาขา'; // Placeholder
      if (!acc[major]) {
        acc[major] = [];
      }
      acc[major].push(item);
      return acc;
    }, {} as Record<string, ScheduleDisplayData[]>);
  }, [displayData]);

  // Handlers for UI actions
  const handleRefresh = useCallback(() => {
    fetchVisitors(filters);
  }, [fetchVisitors, filters]);

  return {
    loading,
    error,
    displayData,
    groupedData,
    filters,
    applyFilters,
    resetFilters,
    handleRefresh,
    lastUpdateTime,
  };
};

export default useVisitorVisitsViewModel;
