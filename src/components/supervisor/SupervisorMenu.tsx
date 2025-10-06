'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSystemLogo } from '@/hooks/use-system-logo';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'แดชบอร์ด',
    href: '/supervisor',
    icon: LayoutDashboard,
  },
  {
    title: 'รายการเอกสาร',
    href: '/supervisor/applications',
    icon: FileText,
  },
  {
    title: 'นักศึกษาที่รับผิดชอบ',
    href: '/supervisor/students',
    icon: Users,
  },
  {
    title: 'นัดหมายนิเทศ',
    href: '/supervisor/schedule',
    icon: Calendar,
  },
  {
    title: 'ตั้งค่า',
    href: '/supervisor/settings',
    icon: Settings,
  },
];

export function SupervisorMenu() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { systemLogo } = useSystemLogo();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {systemLogo ? (
                <img src={systemLogo} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-white font-bold text-sm">S</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">อาจารย์นิเทศ</h2>
              <p className="text-xs text-gray-500">Supervisor</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">ออกจากระบบ</span>}
        </Button>
      </div>
    </div>
  );
}
