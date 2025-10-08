'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export interface DetailItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  statusVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  date?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, string | number>;
  tags?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface DetailListProps {
  // Data
  items: DetailItem[];
  title?: string;
  description?: string;
  
  // Layout
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showDividers?: boolean;
  
  // Selection
  selectedItems?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  showSelection?: boolean;
  
  // Actions
  onItemClick?: (item: DetailItem) => void;
  onEdit?: (item: DetailItem) => void;
  onDelete?: (item: DetailItem) => void;
  onView?: (item: DetailItem) => void;
  
  // UI
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  
  // Custom render
  renderItem?: (item: DetailItem) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

const variantClasses = {
  default: 'space-y-2',
  compact: 'space-y-1',
  detailed: 'space-y-4',
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const statusVariants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function DetailList({
  items,
  title,
  description,
  variant = 'default',
  size = 'md',
  showDividers = true,
  selectedItems = new Set(),
  onSelectionChange,
  showSelection = false,
  onItemClick,
  onEdit,
  onDelete,
  onView,
  className,
  emptyMessage = 'ไม่พบข้อมูล',
  loading = false,
  renderItem,
  renderHeader,
  renderFooter,
}: DetailListProps) {
  const handleItemClick = (item: DetailItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const handleSelection = (itemId: string, selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    onSelectionChange(newSelection);
  };

  const renderDefaultItem = (item: DetailItem) => (
    <div
      key={item.id}
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer',
        selectedItems.has(item.id) && 'bg-blue-50 border-blue-200',
        item.className
      )}
      onClick={() => handleItemClick(item)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showSelection && (
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={(e) => handleSelection(item.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
        
        {item.icon && (
          <div className="text-gray-400 flex-shrink-0">
            {item.icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-medium truncate', sizeClasses[size])}>
              {item.title}
            </h3>
            {item.status && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', statusVariants[item.statusVariant || 'default'])}
              >
                {item.status}
              </Badge>
            )}
          </div>
          
          {item.subtitle && (
            <p className={cn('text-gray-500 truncate', sizeClasses[size])}>
              {item.subtitle}
            </p>
          )}
          
          {item.description && variant !== 'compact' && (
            <p className={cn('text-gray-600 mt-1 line-clamp-2', sizeClasses[size])}>
              {item.description}
            </p>
          )}
          
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(item.metadata).map(([key, value]) => (
                <span key={key} className={cn('text-xs text-gray-500', sizeClasses[size])}>
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.date && (
          <span className={cn('text-gray-400', sizeClasses[size])}>
            {item.date}
          </span>
        )}
        
        {item.actions || (
          <div className="flex items-center gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(item);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  const renderCompactItem = (item: DetailItem) => (
    <div
      key={item.id}
      className={cn(
        'flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer',
        selectedItems.has(item.id) && 'bg-blue-50',
        item.className
      )}
      onClick={() => handleItemClick(item)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {showSelection && (
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={(e) => handleSelection(item.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
        
        {item.icon && (
          <div className="text-gray-400 flex-shrink-0">
            {item.icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-medium truncate', sizeClasses[size])}>
              {item.title}
            </h3>
            {item.status && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', statusVariants[item.statusVariant || 'default'])}
              >
                {item.status}
              </Badge>
            )}
          </div>
          {item.subtitle && (
            <p className={cn('text-gray-500 truncate', sizeClasses[size])}>
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.date && (
          <span className={cn('text-gray-400', sizeClasses[size])}>
            {item.date}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  const renderDetailedItem = (item: DetailItem) => (
    <Card
      key={item.id}
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        selectedItems.has(item.id) && 'ring-2 ring-blue-200',
        item.className
      )}
      onClick={() => handleItemClick(item)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {showSelection && (
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={(e) => handleSelection(item.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            
            {item.icon && (
              <div className="text-gray-400 flex-shrink-0 mt-1">
                {item.icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={cn('font-semibold', sizeClasses[size])}>
                  {item.title}
                </h3>
                {item.status && (
                  <Badge 
                    variant="secondary" 
                    className={cn('text-xs', statusVariants[item.statusVariant || 'default'])}
                  >
                    {item.status}
                  </Badge>
                )}
              </div>
              
              {item.subtitle && (
                <p className={cn('text-gray-600 mb-2', sizeClasses[size])}>
                  {item.subtitle}
                </p>
              )}
              
              {item.description && (
                <p className={cn('text-gray-700 mb-3', sizeClasses[size])}>
                  {item.description}
                </p>
              )}
              
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium text-gray-500', sizeClasses[size])}>
                        {key}:
                      </span>
                      <span className={cn('text-sm text-gray-700', sizeClasses[size])}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.date && (
              <span className={cn('text-gray-400', sizeClasses[size])}>
                {item.date}
              </span>
            )}
            
            {item.actions || (
              <div className="flex items-center gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(item);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-gray-600">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-gray-600">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {(title || description || renderHeader) && (
        <div className="mb-4">
          {renderHeader ? (
            renderHeader()
          ) : (
            <div>
              {title && <h2 className={cn('font-semibold', sizeClasses[size])}>{title}</h2>}
              {description && <p className={cn('text-gray-600 mt-1', sizeClasses[size])}>{description}</p>}
            </div>
          )}
        </div>
      )}
      
      <div className={cn(variantClasses[variant], showDividers && 'divide-y divide-gray-200')}>
        {items.map((item) => {
          if (renderItem) {
            return renderItem(item);
          }
          
          switch (variant) {
            case 'compact':
              return renderCompactItem(item);
            case 'detailed':
              return renderDetailedItem(item);
            default:
              return renderDefaultItem(item);
          }
        })}
      </div>
      
      {renderFooter && (
        <div className="mt-4">
          {renderFooter()}
        </div>
      )}
    </div>
  );
}

// Specialized DetailList components for common use cases
export interface ApplicationDetailListProps {
  applications: Array<{
    id: string;
    studentName: string;
    studentId: string;
    companyName: string;
    position?: string;
    status: string;
    dateApplied: string;
    type: 'internship' | 'co_op';
  }>;
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onView?: (application: any) => void;
  onEdit?: (application: any) => void;
  onDelete?: (application: any) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showSelection?: boolean;
  className?: string;
}

export function ApplicationDetailList({
  applications,
  selectedItems,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  variant = 'default',
  showSelection = true,
  className,
}: ApplicationDetailListProps) {
  const items: DetailItem[] = applications.map((app) => ({
    id: app.id,
    title: app.studentName,
    subtitle: `${app.studentId} • ${app.companyName}`,
    description: app.position,
    status: app.status,
    statusVariant: app.status === 'approved' ? 'success' : 
                   app.status === 'rejected' ? 'error' : 
                   app.status === 'pending' ? 'warning' : 'default',
    date: app.dateApplied,
    icon: app.type === 'internship' ? <FileText className="h-4 w-4" /> : <Building2 className="h-4 w-4" />,
    metadata: {
      'ประเภท': app.type === 'internship' ? 'ฝึกงาน' : 'สหกิจ',
    },
    tags: app.position ? [app.position] : [],
  }));

  return (
    <DetailList
      items={items}
      selectedItems={selectedItems}
      onSelectionChange={onSelectionChange}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      variant={variant}
      showSelection={showSelection}
      className={className}
    />
  );
}
