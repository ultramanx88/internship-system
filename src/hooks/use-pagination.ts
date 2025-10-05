import { useState, useCallback, useMemo } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  updatePagination: (data: Partial<PaginationState>) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    maxLimit = 50,
  } = options;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: Math.min(initialLimit, maxLimit),
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages || 1)),
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit: Math.min(Math.max(1, limit), maxLimit),
      page: 1, // Reset to first page when changing limit
    }));
  }, [maxLimit]);

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: prev.totalPages,
    }));
  }, []);

  const updatePagination = useCallback((data: Partial<PaginationState>) => {
    setPagination(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  const canGoNext = useMemo(() => {
    return pagination.page < pagination.totalPages;
  }, [pagination.page, pagination.totalPages]);

  const canGoPrev = useMemo(() => {
    return pagination.page > 1;
  }, [pagination.page]);

  return {
    pagination,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    updatePagination,
    canGoNext,
    canGoPrev,
  };
}
