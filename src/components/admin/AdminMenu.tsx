'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  Users, 
  Building2, 
  FileText, 
  BarChart2, 
  Settings,
  LogOut,
  UserCheck,
  Database
} from 'lucide-react';
import Image from 'next/image';
import { useSystemLogo } from '@/hooks/use-system-logo';

interface AdminMenuProps {
  className?: string;
}

export function AdminMenu({ className }: AdminMenuProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { systemLogo } = useSystemLogo();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      id: 'users',
      label: 'จัดการผู้ใช้',
      icon: Users,
      href: '/admin/users'
    },
    {
      id: 'companies',
      label: 'สถานประกอบการ',
      icon: Building2,
      href: '/admin/companies'
    },
    {
      id: 'applications',
      label: 'ใบสมัคร',
      icon: FileText,
      href: '/admin/applications'
    },
    {
      id: 'reports',
      label: 'รายงาน',
      icon: BarChart2,
      href: '/admin/reports'
    },
    {
      id: 'educator-roles',
      label: 'บทบาท Educator',
      icon: UserCheck,
      href: '/admin/educator-roles'
    },
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: Settings,
      href: '/admin/settings'
    },
    {
      id: 'system-management',
      label: 'จัดการระบบ',
      icon: Database,
      href: '/admin/system-management'
    }
  ];

  return (
    <div className={cn("w-64 bg-gray-50 border-r border-gray-200 h-full", className)}>
      {/* App Logo Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-white">
        {systemLogo ? (
          <Image src={systemLogo} alt="App Logo" width={28} height={28} className="rounded" />
        ) : (
          <Home className="w-5 h-5" />
        )}
        <span className="font-semibold text-gray-800">Internship System</span>
      </div>
      {/* หน้าแรก */}
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
          isActive('/admin') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">หน้าแรก</span>
      </Link>

      {/* เมนูหลัก */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3 bg-blue-100">
          <span className="font-medium text-blue-800">การจัดการระบบ</span>
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
