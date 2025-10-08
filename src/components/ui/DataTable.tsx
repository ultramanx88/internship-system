'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Search,
  Filter,
  Loader2,
  Trash2
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableProps<T> {
  // Data
  data: T[];
  columns: Column<T>[];
  totalCount: number;
  
  // Loading states
  isLoading?: boolean;
  isDeleting?: boolean;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  
  // Sorting
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  
  // Filtering
  filters?: FilterOption[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  
  // Selection
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  getRowId: (row: T) => string;
  
  // Actions
  onBulkDelete?: (ids: string[]) => void;
  onRefresh?: () => void;
  
  // UI
  title?: string;
  description?: string;
  emptyMessage?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showSelection?: boolean;
  showBulkActions?: boolean;
  
  // Custom render
  renderToolbar?: () => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  totalCount,
  isLoading = false,
  isDeleting = false,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "ค้นหา...",
  sortField,
  sortOrder = 'desc',
  onSortChange,
  filters = [],
  filterValues,
  onFilterChange,
  selectedItems,
  onSelectionChange,
  getRowId,
  onBulkDelete,
  onRefresh,
  title,
  description,
  emptyMessage = "ไม่พบข้อมูล",
  showSearch = true,
  showFilters = true,
  showSelection = true,
  showBulkActions = true,
  renderToolbar,
  renderActions,
}: DataTableProps<T>) {
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Selection logic
  const isAllSelected = !isLoading && data.length > 0 && selectedItems.size === data.length;
  const isSomeSelected = !isLoading && selectedItems.size > 0 && selectedItems.size < data.length;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      const newSelection = new Set(data.map(row => getRowId(row)));
      onSelectionChange(newSelection);
    }
  }, [isAllSelected, data, getRowId, onSelectionChange]);

  const toggleRow = useCallback((id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  }, [selectedItems, onSelectionChange]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.size === 0 || !onBulkDelete) return;
    
    try {
      await onBulkDelete(Array.from(selectedItems));
      onSelectionChange(new Set());
      toast({
        title: 'ลบข้อมูลสำเร็จ',
        description: `ลบข้อมูล ${selectedItems.size} รายการเรียบร้อยแล้ว`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบข้อมูลได้',
      });
    }
  }, [selectedItems, onBulkDelete, onSelectionChange, toast]);

  // Sort handler
  const handleSort = useCallback((field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  }, [sortField, sortOrder, onSortChange]);

  // Render cell content
  const renderCell = useCallback((column: Column<T>, row: T) => {
    const value = column.key.includes('.') 
      ? column.key.split('.').reduce((obj, key) => obj?.[key], row as any)
      : (row as any)[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return value?.toString() || '-';
  }, []);

  // Page size options
  const pageSizeOptions = [5, 10, 20, 50, 100];

  return (
    <Card>
      {(title || description || renderToolbar) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {renderToolbar && renderToolbar()}
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && filters.length > 0 && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={filterValues[filter.key] || 'all'}
                  onValueChange={(value) => onFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedItems.size > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              เลือกแล้ว {selectedItems.size} รายการ
            </span>
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'กำลังลบ...' : 'ลบที่เลือก'}
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAll}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={`${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortField === column.key ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                {renderActions && <TableHead className="w-20">การดำเนินการ</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showSelection ? 1 : 0) + (renderActions ? 1 : 0)}>
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>กำลังโหลด...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showSelection ? 1 : 0) + (renderActions ? 1 : 0)}>
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  const rowId = getRowId(row);
                  const isSelected = selectedItems.has(rowId);
                  
                  return (
                    <TableRow key={rowId} className={isSelected ? 'bg-gray-50' : ''}>
                      {showSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(rowId)}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={String(column.key)} className={column.className}>
                          {renderCell(column, row)}
                        </TableCell>
                      ))}
                      {renderActions && (
                        <TableCell>
                          {renderActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              แสดง {data.length} จาก {totalCount} รายการ
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">ต่อหน้า</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
