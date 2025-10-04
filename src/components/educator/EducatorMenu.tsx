'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  User, 
  Building, 
  Crop, 
  PenTool,
  Clock,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  roles: string[];
  description?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  roles: string[];
}

interface EducatorMenuProps {
  userRole: string;
  educatorRole?: string;
  className?: string;
}

export function EducatorMenu({ userRole, educatorRole, className }: EducatorMenuProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['course-instructor', 'academic-advisor']));
  const pathname = usePathname();

  // กำหนดเมนูตาม role
  const menuSections: MenuSection[] = [
    {
      id: 'general',
      title: 'เมนูทั่วไป',
      roles: ['อาจารย์ประจำวิชา', 'อาจารย์นิเทศ', 'กรรมการ', 'courseInstructor', 'academicAdvisor', 'committee'],
      items: [
        {
          id: 'dashboard',
          label: 'หน้าแรก',
          icon: Home,
          href: '/educator/dashboard',
          roles: ['อาจารย์ประจำวิชา', 'อาจารย์นิเทศ', 'กรรมการ', 'courseInstructor', 'academicAdvisor', 'committee'],
          description: 'ภาพรวมการทำงาน'
        },
        {
          id: 'applications',
          label: 'จัดการใบสมัคร',
          icon: FileText,
          href: '/educator/applications',
          roles: ['อาจารย์ประจำวิชา', 'กรรมการ', 'courseInstructor', 'committee'],
          description: 'ตรวจสอบและอนุมัติใบสมัคร'
        },
        {
          id: 'evaluation',
          label: 'ประเมินผลงาน',
          icon: BarChart3,
          href: '/educator/evaluation',
          roles: ['อาจารย์ประจำวิชา', 'กรรมการ', 'courseInstructor', 'committee'],
          description: 'ประเมินผลงานนักศึกษา'
        },
        {
          id: 'reports',
          label: 'รายงาน',
          icon: FileText,
          href: '/educator/reports',
          roles: ['อาจารย์ประจำวิชา', 'อาจารย์นิเทศ', 'กรรมการ', 'courseInstructor', 'academicAdvisor', 'committee'],
          description: 'รายงานผลการดำเนินงาน'
        }
      ]
    },
    {
      id: 'course-instructor',
      title: 'เมนู อาจารย์ประจำวิชา',
      roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
      items: [
        {
          id: 'coop-requests',
          label: 'รายการขอสหกิจศึกษา / ฝึกงาน',
          icon: FileText,
          href: '/educator/coop-requests',
          roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
          description: 'จัดการคำขอสหกิจศึกษาและฝึกงาน'
        },
        {
          id: 'assign-advisor',
          label: 'มอบหมายอาจารย์นิเทศ',
          icon: User,
          href: '/educator/assign-advisor',
          roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
          description: 'มอบหมายอาจารย์นิเทศให้กับนักศึกษา'
        },
        {
          id: 'supervision-report',
          label: 'รายงานผลการนิเทศ',
          icon: Building,
          href: '/educator/supervision-report',
          roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
          description: 'ดูรายงานผลการนิเทศ'
        },
        {
          id: 'summary-report',
          label: 'รายงานสรุปผลรวม',
          icon: Crop,
          href: '/educator/summary-report',
          roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
          description: 'รายงานสรุปผลรวมทั้งหมด'
        },
        {
          id: 'record-grades',
          label: 'บันทึกเกรด',
          icon: PenTool,
          href: '/educator/record-grades',
          roles: ['อาจารย์ประจำวิชา', 'courseInstructor'],
          description: 'บันทึกเกรดนักศึกษา'
        }
      ]
    },
    {
      id: 'academic-advisor',
      title: 'เมนู อาจารย์นิเทศ',
      roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
      items: [
        {
          id: 'internship-letter',
          label: 'หนังสือขอฝึกงาน',
          icon: FileText,
          href: '/educator/internship-letter',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'จัดการหนังสือขอฝึกงาน'
        },
        {
          id: 'supervision-appointment',
          label: 'นัดหมายนิเทศ',
          icon: User,
          href: '/educator/supervision-appointment',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'นัดหมายการนิเทศ'
        },
        {
          id: 'supervision-report-advisor',
          label: 'รายงานผลการนิเทศ',
          icon: Building,
          href: '/educator/supervision-report-advisor',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'รายงานผลการนิเทศ'
        },
        {
          id: 'record-hours',
          label: 'บันทึกชั่วโมง',
          icon: Clock,
          href: '/educator/record-hours',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'บันทึกชั่วโมงการนิเทศ'
        },
        {
          id: 'student-projects',
          label: 'โปรเจกต์ของนักศึกษา',
          icon: CheckSquare,
          href: '/educator/student-projects',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'จัดการโปรเจกต์ของนักศึกษา'
        },
        {
          id: 'evaluate',
          label: 'ประเมิน',
          icon: PenTool,
          href: '/educator/evaluate',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'ประเมินนักศึกษา'
        },
        {
          id: 'summary-report-advisor',
          label: 'รายงานสรุปผลรวม',
          icon: Crop,
          href: '/educator/summary-report-advisor',
          roles: ['อาจารย์นิเทศ', 'academicAdvisor'],
          description: 'รายงานสรุปผลรวม'
        }
      ]
    },
    {
      id: 'committee',
      title: 'เมนู กรรมการ',
      roles: ['กรรมการ', 'committee'],
      items: [
        {
          id: 'committee-evaluation',
          label: 'ประเมินผลงาน',
          icon: BarChart3,
          href: '/educator/committee-evaluation',
          roles: ['กรรมการ', 'committee'],
          description: 'ประเมินผลงานนักศึกษาและอาจารย์'
        },
        {
          id: 'committee-report',
          label: 'รายงานกรรมการ',
          icon: FileText,
          href: '/educator/committee-report',
          roles: ['กรรมการ', 'committee'],
          description: 'รายงานของกรรมการ'
        },
        {
          id: 'committee-meeting',
          label: 'การประชุมกรรมการ',
          icon: User,
          href: '/educator/committee-meeting',
          roles: ['กรรมการ', 'committee'],
          description: 'จัดการการประชุมกรรมการ'
        }
      ]
    }
  ];

  // ตรวจสอบว่า user มี role ที่สามารถเข้าถึงเมนูได้หรือไม่
  const hasAccessToSection = (section: MenuSection): boolean => {
    if (userRole === 'admin' || userRole === 'staff') return true;
    return section.roles.some(role => 
      role === educatorRole || 
      role === userRole ||
      (userRole === 'instructor' && role === 'อาจารย์ประจำวิชา') ||
      (userRole === 'instructor' && role === 'อาจารย์นิเทศ')
    );
  };

  const hasAccessToItem = (item: MenuItem): boolean => {
    if (userRole === 'admin' || userRole === 'staff') return true;
    return item.roles.some(role => 
      role === educatorRole || 
      role === userRole ||
      (userRole === 'instructor' && role === 'อาจารย์ประจำวิชา') ||
      (userRole === 'instructor' && role === 'อาจารย์นิเทศ')
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={cn("w-64 bg-gray-50 border-r border-gray-200 h-full", className)}>
      {/* หน้าแรก */}
      <Link
        href="/"
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
          isActive('/') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">หน้าแรก</span>
      </Link>

      {/* เมนูตาม role */}
      {menuSections.map((section) => {
        if (!hasAccessToSection(section)) return null;

        const isExpanded = expandedSections.has(section.id);
        const hasAccessibleItems = section.items.some(item => hasAccessToItem(item));

        if (!hasAccessibleItems) return null;

        return (
          <div key={section.id} className="border-b border-gray-200">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">{section.title}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="bg-white">
                {section.items.map((item) => {
                  if (!hasAccessToItem(item)) return null;

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
            )}
          </div>
        );
      })}

      {/* เมนูทั่วไป */}
      <div className="mt-auto border-t border-gray-200">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
            isActive('/settings') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">ตั้งค่า</span>
        </Link>

        <button
          onClick={() => {
            // Handle logout
            console.log('Logout clicked');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">ลงชื่อออก</span>
        </button>
      </div>
    </div>
  );
}
