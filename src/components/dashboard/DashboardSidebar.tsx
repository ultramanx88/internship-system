'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Icons } from '@/components/icons';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  BarChart2,
  CheckSquare,
  Building,
  CalendarClock,
  BookUser,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';

const studentNav = [
  { href: '/student', icon: LayoutDashboard, label: 'แดชบอร์ด' },
  { href: '/student/internships', icon: Briefcase, label: 'การฝึกงาน' },
  { href: '/student/applications', icon: FileText, label: 'ใบสมัครของฉัน' },
];

const teacherNav = [
  { href: '/teacher', icon: LayoutDashboard, label: 'แดชบอร์ด' },
  { href: '/teacher/review', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร' },
];

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'แดชบอร์ด' },
  { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้' },
  { href: '/admin/applications', icon: FileText, label: 'เอกสารขอฝึกงาน' },
  { href: '/admin/schedules', icon: CalendarClock, label: 'นัดหมายนิเทศ' },
  { href: '/admin/reports', icon: ClipboardList, label: 'รายงานผลการนิเทศ' },
  { href: '/admin/companies', icon: Building, label: 'ข้อมูลสถานประกอบการ' },
  { href: '/admin/summary', icon: BarChart2, label: 'รายงานสรุป' },
];

export function DashboardSidebar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return studentNav;
      case 'teacher':
         return teacherNav;
      case 'admin':
         return adminNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold text-foreground">
            InternshipFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {loading ? (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          ) : (
            navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  href={item.href}
                  asChild
                  isActive={pathname.startsWith(item.href)}
                >
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground">
          © 2024 InternshipFlow
        </div>
      </SidebarFooter>
    </>
  );
}
