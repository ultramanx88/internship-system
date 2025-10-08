'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { cn } from '@/lib/utils';
import { 
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
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

export interface GridItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
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

export interface GridListProps {
  // Data
  items: GridItem[];
  title?: string;
  description?: string;
  
  // Layout
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  cardVariant?: 'default' | 'outline' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  
  // Selection
  selectedItems?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  showSelection?: boolean;
  
  // Actions
  onItemClick?: (item: GridItem) => void;
  onEdit?: (item: GridItem) => void;
  onDelete?: (item: GridItem) => void;
  onView?: (item: GridItem) => void;
  
  // UI
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  showHeader?: boolean;
  
  // Custom render
  renderItem?: (item: GridItem) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const cardVariantClasses = {
  default: 'border border-gray-200 hover:border-gray-300',
  outline: 'border-2 border-gray-300 hover:border-gray-400',
  filled: 'bg-gray-50 border border-gray-200 hover:bg-gray-100',
  bordered: 'border-l-4 border-l-blue-500 border border-gray-200 hover:border-l-blue-600',
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

export function GridList({
  items,
  title,
  description,
  columns = 3,
  gap = 'md',
  cardVariant = 'default',
  size = 'md',
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
  showHeader = true,
  renderItem,
  renderHeader,
  renderFooter,
}: GridListProps) {
  const handleItemClick = (item: GridItem) => {
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

  const renderDefaultItem = (item: GridItem) => (
    <Card
      key={item.id}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        cardVariantClasses[cardVariant],
        selectedItems.has(item.id) && 'ring-2 ring-blue-200 border-blue-300',
        item.className
      )}
      onClick={() => handleItemClick(item)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with selection and status */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {showSelection && (
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={(checked) => handleSelection(item.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className={cn('font-semibold truncate', sizeClasses[size])}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className={cn('text-gray-500 truncate mt-1', sizeClasses[size])}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            {item.status && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', statusVariants[item.statusVariant || 'default'])}
              >
                {item.status}
              </Badge>
            )}
          </div>

          {/* Image or Icon */}
          {(item.image || item.icon) && (
            <div className="flex justify-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className={cn('text-gray-600 line-clamp-3', sizeClasses[size])}>
              {item.description}
            </p>
          )}

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="space-y-1">
              {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('text-xs text-gray-500', sizeClasses[size])}>
                    {key}:
                  </span>
                  <span className={cn('text-xs text-gray-700', sizeClasses[size])}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer with date and actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {item.date && (
              <span className={cn('text-gray-400', sizeClasses[size])}>
                {item.date}
              </span>
            )}
            
            <div className="flex items-center gap-1">
              {item.actions || (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompactItem = (item: GridItem) => (
    <Card
      key={item.id}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        cardVariantClasses[cardVariant],
        selectedItems.has(item.id) && 'ring-2 ring-blue-200 border-blue-300',
        item.className
      )}
      onClick={() => handleItemClick(item)}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {showSelection && (
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={(checked) => handleSelection(item.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {item.icon && (
                <div className="text-gray-400 flex-shrink-0">
                  {item.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className={cn('font-medium truncate', sizeClasses[size])}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className={cn('text-gray-500 truncate', sizeClasses[size])}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            {item.status && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', statusVariants[item.statusVariant || 'default'])}
              >
                {item.status}
              </Badge>
            )}
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={className}>
        {showHeader && (title || description || renderHeader) && (
          <div className="mb-6">
            {renderHeader ? (
              renderHeader()
            ) : (
              <div>
                {title && <h2 className={cn('font-semibold mb-2', sizeClasses[size])}>{title}</h2>}
                {description && <p className={cn('text-gray-600', sizeClasses[size])}>{description}</p>}
              </div>
            )}
          </div>
        )}
        
        <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className}>
        {showHeader && (title || description || renderHeader) && (
          <div className="mb-6">
            {renderHeader ? (
              renderHeader()
            ) : (
              <div>
                {title && <h2 className={cn('font-semibold mb-2', sizeClasses[size])}>{title}</h2>}
                {description && <p className={cn('text-gray-600', sizeClasses[size])}>{description}</p>}
              </div>
            )}
          </div>
        )}
        
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              {emptyMessage}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (title || description || renderHeader) && (
        <div className="mb-6">
          {renderHeader ? (
            renderHeader()
          ) : (
            <div>
              {title && <h2 className={cn('font-semibold mb-2', sizeClasses[size])}>{title}</h2>}
              {description && <p className={cn('text-gray-600', sizeClasses[size])}>{description}</p>}
            </div>
          )}
        </div>
      )}
      
      <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
        {items.map((item) => {
          if (renderItem) {
            return renderItem(item);
          }
          
          return renderDefaultItem(item);
        })}
      </div>
      
      {renderFooter && (
        <div className="mt-6">
          {renderFooter()}
        </div>
      )}
    </div>
  );
}

// Specialized GridList components for common use cases
export interface CompanyGridListProps {
  companies: Array<{
    id: string;
    name: string;
    nameEn?: string;
    industry?: string;
    size?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    isActive: boolean;
  }>;
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onView?: (company: any) => void;
  onEdit?: (company: any) => void;
  onDelete?: (company: any) => void;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  showSelection?: boolean;
  className?: string;
}

export function CompanyGridList({
  companies,
  selectedItems,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  columns = 3,
  showSelection = true,
  className,
}: CompanyGridListProps) {
  const items: GridItem[] = companies.map((company) => ({
    id: company.id,
    title: company.name,
    subtitle: company.nameEn,
    description: company.description,
    status: company.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน',
    statusVariant: company.isActive ? 'success' : 'default',
    icon: <Building2 className="h-8 w-8" />,
    metadata: {
      'อุตสาหกรรม': company.industry || 'ไม่ระบุ',
      'ขนาด': company.size || 'ไม่ระบุ',
    },
    tags: company.industry ? [company.industry] : [],
  }));

  return (
    <GridList
      items={items}
      selectedItems={selectedItems}
      onSelectionChange={onSelectionChange}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      showSelection={showSelection}
      className={className}
    />
  );
}

export interface UserGridListProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
    avatar?: string;
  }>;
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onView?: (user: any) => void;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  showSelection?: boolean;
  className?: string;
}

export function UserGridList({
  users,
  selectedItems,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  columns = 4,
  showSelection = true,
  className,
}: UserGridListProps) {
  const items: GridItem[] = users.map((user) => ({
    id: user.id,
    title: user.name,
    subtitle: user.email,
    image: user.avatar,
    status: user.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน',
    statusVariant: user.isActive ? 'success' : 'default',
    icon: <User className="h-8 w-8" />,
    metadata: {
      'บทบาท': user.role,
      'เข้าสู่ระบบล่าสุด': user.lastLogin || 'ไม่เคย',
    },
    tags: [user.role],
  }));

  return (
    <GridList
      items={items}
      selectedItems={selectedItems}
      onSelectionChange={onSelectionChange}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      showSelection={showSelection}
      className={className}
    />
  );
}
