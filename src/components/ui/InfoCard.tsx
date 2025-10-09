'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { 
  User, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

export interface InfoField {
  key: string;
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  copyable?: boolean;
  link?: string;
}

export interface InfoCardProps {
  // Card content
  title: string;
  description?: string;
  icon?: React.ReactNode;
  
  // Data fields
  fields: InfoField[];
  
  // Layout
  columns?: 1 | 2 | 3 | 4;
  layout?: 'grid' | 'list' | 'inline';
  
  // Styling
  variant?: 'default' | 'outline' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Actions
  actions?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  
  // Status
  status?: string;
  statusVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  // Loading
  isLoading?: boolean;
  
  // Custom render
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

const variantClasses = {
  default: 'bg-white border border-gray-200',
  outline: 'bg-transparent border-2 border-gray-300',
  filled: 'bg-gray-50 border border-gray-200',
  bordered: 'bg-white border-l-4 border-blue-500',
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const statusVariants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function InfoCard({
  title,
  description,
  icon,
  fields,
  columns = 2,
  layout = 'grid',
  variant = 'default',
  size = 'md',
  className,
  actions,
  onEdit,
  onDelete,
  onView,
  status,
  statusVariant = 'default',
  isLoading = false,
  renderHeader,
  renderFooter,
}: InfoCardProps) {
  const renderField = (field: InfoField) => {
    const fieldContent = (
      <div className={cn('space-y-1', field.className)}>
        <div className="flex items-center gap-2">
          {field.icon && (
            <span className="text-gray-400">{field.icon}</span>
          )}
          <span className={cn(
            'text-sm font-medium text-gray-500',
            sizeClasses[size]
          )}>
            {field.label}
          </span>
        </div>
        <div className={cn(
          'text-gray-900 break-words',
          sizeClasses[size]
        )}>
          {field.value}
        </div>
      </div>
    );

    if (field.link) {
      return (
        <a 
          href={field.link} 
          className="block hover:bg-gray-50 p-2 rounded transition-colors"
        >
          {fieldContent}
        </a>
      );
    }

    return fieldContent;
  };

  const renderFields = () => {
    if (layout === 'list') {
      return (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="flex items-start gap-4">
              {field.icon && (
                <span className="text-gray-400 mt-1">{field.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium text-gray-500',
                  sizeClasses[size]
                )}>
                  {field.label}
                </div>
                <div className={cn(
                  'text-gray-900 break-words',
                  sizeClasses[size]
                )}>
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (layout === 'inline') {
      return (
        <div className="flex flex-wrap gap-4">
          {fields.map((field) => (
            <div key={field.key} className="flex items-center gap-2">
              {field.icon && (
                <span className="text-gray-400">{field.icon}</span>
              )}
              <span className={cn(
                'text-sm font-medium text-gray-500',
                sizeClasses[size]
              )}>
                {field.label}:
              </span>
              <span className={cn(
                'text-gray-900',
                sizeClasses[size]
              )}>
                {field.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Grid layout (default)
    return (
      <div className={cn('grid gap-4', columnClasses[columns])}>
        {fields.map(renderField)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn(variantClasses[variant], className)}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardHeader>
        {renderHeader ? (
          renderHeader()
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <span className="text-gray-600">{icon}</span>
              )}
              <div>
                <CardTitle className={cn('text-lg', sizeClasses[size])}>
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className={cn('mt-1', sizeClasses[size])}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {status && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', statusVariants[statusVariant])}
              >
                {status}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {renderFields()}
      </CardContent>

      {(actions || onEdit || onDelete || onView || renderFooter) && (
        <div className="px-6 pb-6">
          {renderFooter ? (
            renderFooter()
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onView}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    ดู
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                )}
              </div>
              {actions}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Specialized InfoCard components for common use cases
export interface StudentInfoCardProps {
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    faculty?: string;
    major?: string;
    year?: number;
    gpa?: number;
    t_name?: string;
    e_name?: string;
  };
  showActions?: boolean;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function StudentInfoCard({ 
  student, 
  showActions = true, 
  onEdit, 
  onView, 
  onDelete 
}: StudentInfoCardProps) {
  const fields: InfoField[] = [
    {
      key: 'id',
      label: 'รหัสนักศึกษา',
      value: student.id,
      icon: <User className="h-4 w-4" />,
    },
    {
      key: 'name',
      label: 'ชื่อ-นามสกุล',
      value: student.t_name || student.e_name || student.name,
      icon: <User className="h-4 w-4" />,
    },
    {
      key: 'email',
      label: 'อีเมล',
      value: student.email,
      icon: <Mail className="h-4 w-4" />,
      copyable: true,
    },
    {
      key: 'phone',
      label: 'เบอร์โทรศัพท์',
      value: student.phone || 'ไม่ระบุ',
      icon: <Phone className="h-4 w-4" />,
    },
    {
      key: 'faculty',
      label: 'คณะ',
      value: student.faculty || 'ไม่ระบุ',
    },
    {
      key: 'major',
      label: 'สาขาวิชา',
      value: student.major || 'ไม่ระบุ',
    },
    {
      key: 'year',
      label: 'ชั้นปี',
      value: student.year ? `ปีที่ ${student.year}` : 'ไม่ระบุ',
    },
    {
      key: 'gpa',
      label: 'GPA',
      value: student.gpa ? student.gpa.toFixed(2) : 'ไม่ระบุ',
    },
  ];

  return (
    <InfoCard
      title="ข้อมูลนักศึกษา"
      description="รายละเอียดข้อมูลส่วนตัวของนักศึกษา"
      icon={<User className="h-5 w-5" />}
      fields={fields}
      columns={2}
      onEdit={showActions ? onEdit : undefined}
      onView={showActions ? onView : undefined}
      onDelete={showActions ? onDelete : undefined}
    />
  );
}

export interface CompanyInfoCardProps {
  company: {
    id: string;
    name: string;
    nameEn?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
  };
  showActions?: boolean;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function CompanyInfoCard({ 
  company, 
  showActions = true, 
  onEdit, 
  onView, 
  onDelete 
}: CompanyInfoCardProps) {
  const fields: InfoField[] = [
    {
      key: 'name',
      label: 'ชื่อบริษัท',
      value: company.name,
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      key: 'nameEn',
      label: 'ชื่อภาษาอังกฤษ',
      value: company.nameEn || 'ไม่ระบุ',
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      key: 'address',
      label: 'ที่อยู่',
      value: company.address || 'ไม่ระบุ',
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      key: 'phone',
      label: 'เบอร์โทรศัพท์',
      value: company.phone || 'ไม่ระบุ',
      icon: <Phone className="h-4 w-4" />,
    },
    {
      key: 'email',
      label: 'อีเมล',
      value: company.email || 'ไม่ระบุ',
      icon: <Mail className="h-4 w-4" />,
      copyable: true,
    },
    {
      key: 'website',
      label: 'เว็บไซต์',
      value: company.website || 'ไม่ระบุ',
      icon: <Building2 className="h-4 w-4" />,
      link: company.website,
    },
    {
      key: 'industry',
      label: 'อุตสาหกรรม',
      value: company.industry || 'ไม่ระบุ',
    },
    {
      key: 'size',
      label: 'ขนาดบริษัท',
      value: company.size || 'ไม่ระบุ',
    },
  ];

  return (
    <InfoCard
      title="ข้อมูลบริษัท"
      description="รายละเอียดข้อมูลของบริษัท"
      icon={<Building2 className="h-5 w-5" />}
      fields={fields}
      columns={2}
      onEdit={showActions ? onEdit : undefined}
      onView={showActions ? onView : undefined}
      onDelete={showActions ? onDelete : undefined}
    />
  );
}
