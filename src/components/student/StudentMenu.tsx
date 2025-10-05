'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Star, 
  Settings,
  LogOut
} from 'lucide-react';

interface StudentMenuProps {
  className?: string;
}

export function StudentMenu({ className }: StudentMenuProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      id: 'application-form',
      label: 'ยื่นขอสหกิจศึกษา / ฝึกงาน',
      icon: FileText,
      href: '/student/application-form'
    },
    {
      id: 'project-details',
      label: 'รายละเอียดโปรเจกต์',
      icon: ClipboardList,
      href: '/student/project-details'
    },
    {
      id: 'evaluation',
      label: 'แบบประเมิน',
      icon: Star,
      href: '/student/evaluation'
    },
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: Settings,
      href: '/student/settings'
    }
  ];

  return (
    <div className={cn("w-64 bg-gray-50 border-r border-gray-200 h-full", className)}>
      {/* หน้าแรก */}
      <Link
        href="/student"
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
          isActive('/student') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">หน้าแรก</span>
      </Link>

      {/* เมนูหลัก */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3 bg-purple-100">
          <span className="font-medium text-purple-800">ระบบนักศึกษา</span>
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
                  isActive(item.href) && "bg-purple-50 text-purple-700 border-r-2 border-purple-500"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ออกจากระบบ */}
      <div className="mt-auto p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}
