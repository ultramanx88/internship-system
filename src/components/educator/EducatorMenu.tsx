'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  FileText, 
  User, 
  Building, 
  Crop, 
  PenTool,
  Clock,
  CheckSquare,
  Settings,
  LogOut
} from 'lucide-react';


interface EducatorMenuProps {
  userRole: string;
  educatorRole?: string;
  className?: string;
}

export function EducatorMenu({ userRole, educatorRole, className }: EducatorMenuProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // กำหนดเมนูตาม role - แสดงเฉพาะเมนูที่ตรงกับ role ของผู้ใช้
  const getMenuItems = () => {
    const currentRole = educatorRole || userRole;
    
    if (currentRole === 'อาจารย์ประจำวิชา' || currentRole === 'courseInstructor') {
      return [
        {
          id: 'coop-requests',
          label: 'รายการขอสหกิจศึกษา/ฝึกงาน',
          icon: FileText,
          href: '/educator/coop-requests'
        },
        {
          id: 'assign-advisor',
          label: 'มอบหมายอาจารย์นิเทศ',
          icon: User,
          href: '/educator/assign-advisor'
        },
        {
          id: 'supervision-report',
          label: 'รายงานผลการนิเทศ',
          icon: Building,
          href: '/educator/supervision-report'
        },
        {
          id: 'summary-report',
          label: 'รายงานสรุปผลรวม',
          icon: Crop,
          href: '/educator/summary-report'
        },
        {
          id: 'record-grades',
          label: 'บันทึกเกรด',
          icon: PenTool,
          href: '/educator/record-grades'
        }
      ];
    }
    
    if (currentRole === 'อาจารย์นิเทศ' || currentRole === 'academicAdvisor') {
      return [
        {
          id: 'internship-letter',
          label: 'หนังสือฝึกงาน',
          icon: FileText,
          href: '/educator/internship-letter'
        },
        {
          id: 'supervision-appointment',
          label: 'นัดหมายนิเทศ',
          icon: Clock,
          href: '/educator/supervision-appointment'
        },
        {
          id: 'supervision-report-advisor',
          label: 'ผลรายงานนิเทศ',
          icon: Building,
          href: '/educator/supervision-report-advisor'
        },
        {
          id: 'record-hours',
          label: 'บันทึกชั่วโมง',
          icon: Clock,
          href: '/educator/record-hours'
        },
        {
          id: 'student-projects',
          label: 'โปรเจคของนักศึกษา',
          icon: CheckSquare,
          href: '/educator/student-projects'
        },
        {
          id: 'evaluate',
          label: 'ประเมิน',
          icon: PenTool,
          href: '/educator/evaluate'
        },
        {
          id: 'summary-report-advisor',
          label: 'รายงานสรุปผล',
          icon: Crop,
          href: '/educator/summary-report-advisor'
        }
      ];
    }
    
    if (currentRole === 'กรรมการ' || currentRole === 'committee') {
      return [
        {
          id: 'committee-appointment',
          label: 'นัดหมายนิเทศ',
          icon: Clock,
          href: '/educator/committee-appointment'
        },
        {
          id: 'committee-supervision-report',
          label: 'ผลรายงานนิเทศ',
          icon: Building,
          href: '/educator/committee-supervision-report'
        },
        {
          id: 'committee-student-projects',
          label: 'โปรเจคของนักศึกษา',
          icon: CheckSquare,
          href: '/educator/committee-student-projects'
        },
        {
          id: 'committee-evaluate',
          label: 'ประเมิน',
          icon: PenTool,
          href: '/educator/committee-evaluate'
        },
        {
          id: 'committee-summary-report',
          label: 'รายงานสรุปผลรวม',
          icon: Crop,
          href: '/educator/committee-summary-report'
        }
      ];
    }
    
    // Default fallback
    return [];
  };


  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const menuItems = getMenuItems();
  const currentRole = educatorRole || userRole;

  return (
    <div className={cn("w-64 bg-gray-50 border-r border-gray-200 h-full", className)}>
      {/* หน้าแรก */}
      <Link
        href="/educator"
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
          isActive('/educator') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">หน้าแรก</span>
      </Link>

      {/* เมนูตาม role - แสดงเฉพาะเมนูที่ตรงกับ role */}
      {menuItems.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 bg-orange-100">
            <span className="font-medium text-orange-800">
              {currentRole === 'อาจารย์ประจำวิชา' || currentRole === 'courseInstructor' ? 'อาจารย์ประจำวิชา' :
               currentRole === 'อาจารย์นิเทศ' || currentRole === 'academicAdvisor' ? 'อาจารย์นิเทศ' :
               currentRole === 'กรรมการ' || currentRole === 'committee' ? 'กรรมการ' : 'เมนู'}
            </span>
          </div>
          <div className="bg-white">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors",
                    isActive(item.href) && "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* เมนูท้าย */}
      <div className="mt-auto border-t border-gray-200">
        <Link
          href="/educator/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
            isActive('/educator/settings') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">ตั้งค่า</span>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">ลงชื่อออก</span>
        </button>
      </div>
    </div>
  );
}
