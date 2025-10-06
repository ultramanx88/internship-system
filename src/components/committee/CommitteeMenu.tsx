'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useSystemLogo } from '@/hooks/use-system-logo';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  CheckSquare,
  Settings,
  LogOut
} from 'lucide-react';
import Image from 'next/image';

interface CommitteeMenuProps {
  className?: string;
}

export function CommitteeMenu({ className }: CommitteeMenuProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { systemLogo } = useSystemLogo();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      label: 'หน้าแรก',
      href: '/committee',
      icon: Home
    },
    {
      label: 'รายการคำขอ',
      href: '/committee/applications',
      icon: FileText
    },
    {
      label: 'การประเมิน',
      href: '/committee/evaluations',
      icon: CheckSquare
    },
    {
      label: 'รายงาน',
      href: '/committee/reports',
      icon: ClipboardList
    },
    {
      label: 'ตั้งค่า',
      href: '/committee/settings',
      icon: Settings
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
        href="/committee"
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
          isActive('/committee') && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">หน้าแรก</span>
      </Link>

      {/* เมนูหลัก */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3 bg-orange-100">
          <span className="font-medium text-orange-800">ระบบกรรมการ</span>
        </div>
        <div className="bg-white">
          {menuItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
                  isActive(item.href) && "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
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
