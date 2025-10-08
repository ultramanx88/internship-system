'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Pause, 
  Play,
  User,
  Building2,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Star,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

export type StatusType = 
  | 'success' | 'error' | 'warning' | 'info' | 'pending' | 'active' | 'inactive'
  | 'approved' | 'rejected' | 'pending_approval' | 'draft' | 'published'
  | 'completed' | 'in_progress' | 'cancelled' | 'on_hold'
  | 'online' | 'offline' | 'busy' | 'away'
  | 'verified' | 'unverified' | 'blocked' | 'suspended'
  | 'high' | 'medium' | 'low' | 'urgent'
  | 'male' | 'female' | 'other'
  | 'public' | 'private' | 'restricted'
  | 'enabled' | 'disabled'
  | 'read' | 'unread'
  | 'starred' | 'unstarred';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  customIcon?: React.ReactNode;
}

const statusConfig: Record<StatusType, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  // Basic statuses
  success: {
    label: 'สำเร็จ',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  error: {
    label: 'ข้อผิดพลาด',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  warning: {
    label: 'คำเตือน',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <AlertCircle className="h-3 w-3" />
  },
  info: {
    label: 'ข้อมูล',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <AlertCircle className="h-3 w-3" />
  },
  pending: {
    label: 'รอดำเนินการ',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Clock className="h-3 w-3" />
  },
  active: {
    label: 'ใช้งาน',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <Play className="h-3 w-3" />
  },
  inactive: {
    label: 'ไม่ใช้งาน',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Pause className="h-3 w-3" />
  },

  // Approval statuses
  approved: {
    label: 'อนุมัติ',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  rejected: {
    label: 'ปฏิเสธ',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  pending_approval: {
    label: 'รออนุมัติ',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-3 w-3" />
  },
  draft: {
    label: 'ร่าง',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <FileText className="h-3 w-3" />
  },
  published: {
    label: 'เผยแพร่',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Globe className="h-3 w-3" />
  },

  // Workflow statuses
  completed: {
    label: 'เสร็จสิ้น',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  in_progress: {
    label: 'กำลังดำเนินการ',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Clock className="h-3 w-3" />
  },
  cancelled: {
    label: 'ยกเลิก',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  on_hold: {
    label: 'ระงับ',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Pause className="h-3 w-3" />
  },

  // User statuses
  online: {
    label: 'ออนไลน์',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  offline: {
    label: 'ออฟไลน์',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <XCircle className="h-3 w-3" />
  },
  busy: {
    label: 'ไม่ว่าง',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  away: {
    label: 'ไม่อยู่',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-3 w-3" />
  },

  // Verification statuses
  verified: {
    label: 'ยืนยันแล้ว',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <Shield className="h-3 w-3" />
  },
  unverified: {
    label: 'ยังไม่ยืนยัน',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <AlertCircle className="h-3 w-3" />
  },
  blocked: {
    label: 'ถูกบล็อก',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  suspended: {
    label: 'ระงับการใช้งาน',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <Lock className="h-3 w-3" />
  },

  // Priority levels
  high: {
    label: 'สูง',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertCircle className="h-3 w-3" />
  },
  medium: {
    label: 'ปานกลาง',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-3 w-3" />
  },
  low: {
    label: 'ต่ำ',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  urgent: {
    label: 'ด่วน',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertCircle className="h-3 w-3" />
  },

  // Gender
  male: {
    label: 'ชาย',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <User className="h-3 w-3" />
  },
  female: {
    label: 'หญิง',
    className: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: <User className="h-3 w-3" />
  },
  other: {
    label: 'อื่นๆ',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <User className="h-3 w-3" />
  },

  // Visibility
  public: {
    label: 'สาธารณะ',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <Globe className="h-3 w-3" />
  },
  private: {
    label: 'ส่วนตัว',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Lock className="h-3 w-3" />
  },
  restricted: {
    label: 'จำกัด',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Shield className="h-3 w-3" />
  },

  // Enable/Disable
  enabled: {
    label: 'เปิดใช้งาน',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: <Unlock className="h-3 w-3" />
  },
  disabled: {
    label: 'ปิดใช้งาน',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Lock className="h-3 w-3" />
  },

  // Read status
  read: {
    label: 'อ่านแล้ว',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Eye className="h-3 w-3" />
  },
  unread: {
    label: 'ยังไม่อ่าน',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <EyeOff className="h-3 w-3" />
  },

  // Starred
  starred: {
    label: 'ดาว',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Star className="h-3 w-3" />
  },
  unstarred: {
    label: 'ไม่ดาว',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Star className="h-3 w-3" />
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1.5',
  lg: 'text-base px-3 py-2',
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  variant = 'default',
  className,
  customIcon,
}: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: label || status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <AlertCircle className="h-3 w-3" />
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1 border font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && (
        <span className={iconSize}>
          {customIcon || config.icon}
        </span>
      )}
      {label || config.label}
    </Badge>
  );
}

// Specialized status badges for common use cases
export function WorkflowStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status as StatusType} />;
}

export function UserStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status as StatusType} />;
}

export function ApprovalStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status as StatusType} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge status={priority as StatusType} />;
}

export function GenderBadge({ gender }: { gender: string }) {
  return <StatusBadge status={gender as StatusType} />;
}

export function VisibilityBadge({ visibility }: { visibility: string }) {
  return <StatusBadge status={visibility as StatusType} />;
}
