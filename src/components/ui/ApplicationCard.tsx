'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { 
  User, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  GraduationCap,
  MapPin,
  ExternalLink
} from 'lucide-react';

export interface ApplicationData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  companyName: string;
  companyId?: string;
  position?: string;
  type: 'internship' | 'co_op';
  status: string;
  dateApplied: string;
  currentApprovals?: number;
  requiredApprovals?: number;
  pendingCommitteeReview?: boolean;
  studentReason?: string;
  expectedSkills?: string[];
  projectProposal?: string;
  preferredStartDate?: string;
  availableDuration?: number;
  feedback?: string;
  faculty?: string;
  major?: string;
  year?: number;
  gpa?: number;
  supervisorName?: string;
  supervisorEmail?: string;
  advisorName?: string;
  advisorEmail?: string;
}

export interface ApplicationCardProps {
  // Application data
  application: ApplicationData;
  
  // Selection
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showSelection?: boolean;
  
  // Actions
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onAssignSupervisor?: () => void;
  onAssignAdvisor?: () => void;
  
  // UI
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Status
  showStatus?: boolean;
  showProgress?: boolean;
  showActions?: boolean;
  
  // Custom render
  renderActions?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

const variantClasses = {
  default: 'border border-gray-200 hover:border-gray-300 transition-colors',
  compact: 'border border-gray-200 hover:border-gray-300 transition-colors p-3',
  detailed: 'border border-gray-200 hover:border-gray-300 transition-colors shadow-sm',
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function ApplicationCard({
  application,
  selected = false,
  onSelect,
  showSelection = false,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onAssignSupervisor,
  onAssignAdvisor,
  variant = 'default',
  size = 'md',
  className,
  showStatus = true,
  showProgress = true,
  showActions = true,
  renderActions,
  renderFooter,
}: ApplicationCardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'internship':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">ฝึกงาน</Badge>;
      case 'co_op':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">สหกิจ</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      'pending': { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'approved': { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      'rejected': { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
      'under_review': { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'completed': { variant: 'outline', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      'cancelled': { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' },
    };

    const config = statusMap[status] || { variant: 'outline' as const, className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderCompactView = () => (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {showSelection && (
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-medium truncate', sizeClasses[size])}>
              {application.studentName}
            </h3>
            {getTypeBadge(application.type)}
          </div>
          <p className={cn('text-gray-500 truncate', sizeClasses[size])}>
            {application.studentId} • {application.companyName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className={cn('text-gray-500', sizeClasses[size])}>
              {formatDate(application.dateApplied)}
            </span>
            {showStatus && getStatusBadge(application.status)}
          </div>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-1">
          {onView && (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showSelection && (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('font-semibold', sizeClasses[size])}>
                {application.studentName}
              </h3>
              {getTypeBadge(application.type)}
            </div>
            <p className={cn('text-gray-500', sizeClasses[size])}>
              {application.studentId}
            </p>
          </div>
        </div>
        {showStatus && getStatusBadge(application.status)}
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className={cn('text-gray-600', sizeClasses[size])}>
            {application.companyName}
          </span>
        </div>
        {application.position && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className={cn('text-gray-600', sizeClasses[size])}>
              {application.position}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={cn('text-gray-600', sizeClasses[size])}>
            {formatDate(application.dateApplied)}
          </span>
        </div>
        {application.faculty && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span className={cn('text-gray-600', sizeClasses[size])}>
              {application.faculty}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      {showProgress && application.currentApprovals !== undefined && application.requiredApprovals !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-medium text-gray-600', sizeClasses[size])}>
              ความคืบหน้า
            </span>
            <span className={cn('text-sm text-gray-500', sizeClasses[size])}>
              {application.currentApprovals}/{application.requiredApprovals}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(application.currentApprovals / application.requiredApprovals) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Skills */}
      {application.expectedSkills && application.expectedSkills.length > 0 && (
        <div className="space-y-2">
          <span className={cn('text-sm font-medium text-gray-600', sizeClasses[size])}>
            ทักษะที่คาดหวัง
          </span>
          <div className="flex flex-wrap gap-1">
            {application.expectedSkills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {application.expectedSkills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{application.expectedSkills.length - 3} อื่นๆ
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {onView && (
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              ดู
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              แก้ไข
            </Button>
          )}
          {onApprove && (
            <Button variant="default" size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              อนุมัติ
            </Button>
          )}
          {onReject && (
            <Button variant="destructive" size="sm" onClick={onReject}>
              <XCircle className="h-4 w-4 mr-1" />
              ปฏิเสธ
            </Button>
          )}
          {onAssignSupervisor && (
            <Button variant="outline" size="sm" onClick={onAssignSupervisor}>
              <User className="h-4 w-4 mr-1" />
              มอบหมายผู้ควบคุม
            </Button>
          )}
          {onAssignAdvisor && (
            <Button variant="outline" size="sm" onClick={onAssignAdvisor}>
              <GraduationCap className="h-4 w-4 mr-1" />
              มอบหมายที่ปรึกษา
            </Button>
          )}
          {renderActions && renderActions()}
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardContent className={variant === 'compact' ? 'p-3' : 'p-4'}>
        {variant === 'compact' ? renderCompactView() : renderDetailedView()}
        {renderFooter && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {renderFooter()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized ApplicationCard components
export interface ApplicationListProps {
  applications: ApplicationData[];
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onView?: (application: ApplicationData) => void;
  onEdit?: (application: ApplicationData) => void;
  onDelete?: (application: ApplicationData) => void;
  onApprove?: (application: ApplicationData) => void;
  onReject?: (application: ApplicationData) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showSelection?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ApplicationList({
  applications,
  selectedItems,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  variant = 'default',
  showSelection = true,
  showActions = true,
  className,
}: ApplicationListProps) {
  const handleSelect = (applicationId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(applicationId);
    } else {
      newSelection.delete(applicationId);
    }
    onSelectionChange(newSelection);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          selected={selectedItems.has(application.id)}
          onSelect={(selected) => handleSelect(application.id, selected)}
          onView={onView ? () => onView(application) : undefined}
          onEdit={onEdit ? () => onEdit(application) : undefined}
          onDelete={onDelete ? () => onDelete(application) : undefined}
          onApprove={onApprove ? () => onApprove(application) : undefined}
          onReject={onReject ? () => onReject(application) : undefined}
          variant={variant}
          showSelection={showSelection}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

export interface ApplicationGridProps {
  applications: ApplicationData[];
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onView?: (application: ApplicationData) => void;
  onEdit?: (application: ApplicationData) => void;
  onDelete?: (application: ApplicationData) => void;
  onApprove?: (application: ApplicationData) => void;
  onReject?: (application: ApplicationData) => void;
  columns?: 1 | 2 | 3 | 4;
  showSelection?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ApplicationGrid({
  applications,
  selectedItems,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  columns = 3,
  showSelection = true,
  showActions = true,
  className,
}: ApplicationGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const handleSelect = (applicationId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(applicationId);
    } else {
      newSelection.delete(applicationId);
    }
    onSelectionChange(newSelection);
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          selected={selectedItems.has(application.id)}
          onSelect={(selected) => handleSelect(application.id, selected)}
          onView={onView ? () => onView(application) : undefined}
          onEdit={onEdit ? () => onEdit(application) : undefined}
          onDelete={onDelete ? () => onDelete(application) : undefined}
          onApprove={onApprove ? () => onApprove(application) : undefined}
          onReject={onReject ? () => onReject(application) : undefined}
          variant="compact"
          showSelection={showSelection}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
