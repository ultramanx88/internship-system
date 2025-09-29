'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
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
  Settings,
  UserCheck,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navConfig = {
  student: [
    { href: '/student', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { href: '/student/internships', icon: Briefcase, label: 'การฝึกงาน' },
    { href: '/student/applications', icon: FileText, label: 'ใบสมัครของฉัน' },
    { href: '/student/evaluation', icon: Star, label: 'ประเมินผล' },
  ],
  staff: [
    { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้' },
    { href: '/admin/applications', icon: FileText, label: 'เอกสารขอฝึกงาน' },
  ],
  courseInstructor: [
    { href: '/teacher', icon: LayoutDashboard, label: 'แดชบอร์ด (อ.ประจำวิชา)' },
    { href: '/teacher/review', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร' },
    { href: '/instructor/assign_visitor', icon: UserCheck, label: 'มอบหมายอาจารย์นิเทศ' },
  ],
  committee: [
    { href: '/teacher/review', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร (กก.)' },
  ],
  visitor: [
     { href: '/visitor/schedule', icon: CalendarClock, label: 'ตารางนิเทศ' },
     { href: '/visitor/visits', icon: ClipboardList, label: 'รายงานผลนิเทศ' },
  ],
  admin: [
    { href: '/admin', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้' },
    { 
      id: 'applications',
      icon: FileText, 
      label: 'เอกสารขอฝึกงาน',
      subItems: [
        { href: '/admin/applications', label: 'รายการใบสมัคร'},
        { href: '/admin/applications/pending', label: 'รอการตรวจสอบ'},
      ]
    },
    { href: '/admin/schedules', icon: CalendarClock, label: 'นัดหมายนิเทศ' },
    { href: '/admin/reports', icon: ClipboardList, label: 'รายงานผลการนิเทศ' },
    { href: '/admin/companies', icon: Building, label: 'ข้อมูลสถานประกอบการ' },
    { href: '/admin/summary', icon: BarChart2, label: 'รายงานสรุป' },
    { href: '/admin/settings', icon: Settings, label: 'ตั้งค่า' },
  ],
};


export function DashboardSidebar() {
  const { user, loading } = useAuth();
  const { logo } = useAppTheme();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['applications']));

  const getNavItems = () => {
    if (!user || !user.roles) return [];
    const uniqueNavs = new Map();

    user.roles.forEach(role => {
      const navs = navConfig[role as keyof typeof navConfig];
      if (navs) {
        navs.forEach(nav => {
            const key = nav.id || nav.href;
            if (key && !uniqueNavs.has(key)) {
                uniqueNavs.set(key, nav);
            }
        })
      }
    });

    return Array.from(uniqueNavs.values());
  };
  
  const toggleMenu = (id: string) => {
    setOpenMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    })
  }

  const navItems = getNavItems();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" logoUrl={logo} />
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
              <SidebarMenuItem key={item.id || item.href}>
                 {item.subItems ? (
                    <Collapsible open={openMenus.has(item.id)} onOpenChange={() => toggleMenu(item.id)}>
                        <CollapsibleTrigger asChild>
                             <SidebarMenuButton 
                                variant="ghost" 
                                className="w-full justify-between"
                                isActive={pathname.startsWith(`/admin/${item.id}`)}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon />
                                    <span>{item.label}</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", openMenus.has(item.id) && "rotate-180")}/>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.subItems.map(subItem => (
                                    <SidebarMenuSubItem key={subItem.href}>
                                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                            <Link href={subItem.href}>{subItem.label}</Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                 ) : (
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                 )}
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
