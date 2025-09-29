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
} from 'lucide-react';

const studentNav = [
  { href: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/internships', icon: Briefcase, label: 'Internships' },
  { href: '/student/applications', icon: FileText, label: 'My Applications' },
];

const teacherNav = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/review', icon: CheckSquare, label: 'Review Applications' },
];

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/applications', icon: Users, label: 'All Applications' },
  { href: '/admin/stats', icon: BarChart2, label: 'Statistics' },
];

export function DashboardSidebar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        // For this demo, we'll map all student pages to /student
        return studentNav.map(item => ({...item, href: '/student'}));
      case 'teacher':
        // Map all teacher pages to /teacher
         return teacherNav.map(item => ({...item, href: '/teacher'}));
      case 'admin':
        // Map all admin pages to /admin
         return adminNav.map(item => ({...item, href: '/admin'}));
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
            </>
          ) : (
            navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  href={item.href}
                  asChild
                  isActive={pathname === item.href}
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
