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
    { href: '/student', icon: LayoutDashboard, label: 'หน้าแรก' },
    { href: '/student/application-form', icon: FileText, label: 'ยื่นขอสหกิจศึกษา / ฝึกงาน' },
    { href: '/student/project-details', icon: ClipboardList, label: 'รายละเอียดโปรเจกต์' },
    { href: '/student/evaluation', icon: Star, label: 'แบบประเมิน' },
    { href: '/student/settings', icon: Settings, label: 'ตั้งค่า' },
  ],
  staff: [
    { href: '/staff', icon: LayoutDashboard, label: 'หน้าแรก' },
    { href: '/staff/students', icon: Users, label: 'อัปโหลดรายชื่อ' },
    { href: '/staff/applications', icon: FileText, label: 'เอกสารขอสหกิจศึกษา / ฝึกงาน' },
    { href: '/staff/documents', icon: BookUser, label: 'นัดหมายนิเทศ' },
    { href: '/staff/academic', icon: GraduationCap, label: 'โครงสร้างวิชาการ' },
    { href: '/staff/reports', icon: BarChart2, label: 'รายงานผลการนิเทศ' },
    { href: '/staff/summary', icon: ClipboardList, label: 'รายงานสรุปผลการ' },
    { href: '/staff/evaluation', icon: Star, label: 'รายงานการประเมินสถานประกอบการ' },
    { href: '/staff/settings', icon: Settings, label: 'ตั้งค่า' },
  ],
  courseInstructor: [
    { href: '/educator', icon: LayoutDashboard, label: 'แดชบอร์ด (อ.ประจำวิชา)' },
    { href: '/educator/applications', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร' },
    { href: '/instructor/assign_visitor', icon: UserCheck, label: 'มอบหมายอาจารย์นิเทศก์' },
  ],
  'อาจารย์ประจำวิชา': [
    { href: '/educator', icon: LayoutDashboard, label: 'แดชบอร์ด (อ.ประจำวิชา)' },
    { href: '/educator/applications', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร' },
    { href: '/instructor/assign_visitor', icon: UserCheck, label: 'มอบหมายอาจารย์นิเทศก์' },
  ],
  committee: [
    { href: '/educator/committee/applications', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร (กก.)' },
  ],
  'กรรมการ': [
    { href: '/educator/committee/applications', icon: CheckSquare, label: 'ตรวจสอบใบสมัคร (กก.)' },
  ],
  visitor: [
     { href: '/visitor/schedule', icon: CalendarClock, label: 'ตารางนิเทศ' },
     { href: '/visitor/visits', icon: ClipboardList, label: 'รายงานผลนิเทศ' },
  ],
  'อาจารย์นิเทศก์': [
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
        { href: '/admin/applications/print', label: 'พิมพ์เอกสาร'},
      ]
    },
    { href: '/admin/companies', icon: Building, label: 'ข้อมูลสถานประกอบการ' },
    { href: '/admin/academic', icon: GraduationCap, label: 'โครงสร้างวิชาการ' },
    { href: '/admin/schedules', icon: CalendarClock, label: 'นัดหมายนิเทศ' },
    { href: '/admin/reports', icon: ClipboardList, label: 'รายงานผลการนิเทศ' },
    { href: '/admin/summary', icon: BarChart2, label: 'รายงานสรุป' },
    { 
      id: 'documents',
      icon: FileText, 
      label: 'จัดการเอกสาร',
      subItems: [
        { href: '/admin/documents/pdf-templates', label: 'เทมเพลต PDF'},
        { href: '/admin/documents/html-templates', label: 'เทมเพลต HTML'},
        { href: '/admin/documents/templates', label: 'เทมเพลตเอกสาร'},
        { href: '/admin/documents/fonts', label: 'จัดการฟอนต์'},
        { href: '/admin/documents/generated', label: 'เอกสารที่สร้าง'},
      ]
    },
    { href: '/admin/settings', icon: Settings, label: 'ตั้งค่า' },
  ],
};


export function DashboardSidebar() {
  const { user, loading } = useAuth();
  const { logo } = useAppTheme();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['applications', 'documents']));

  const getNavItems = () => {
    if (!user || !user.roles) return [];
    const uniqueNavs = new Map();

    // Robust roles parsing: supports array, JSON string, CSV, or single role
    let userRoles: string[] = [];
    if (Array.isArray(user.roles)) {
      userRoles = user.roles as string[];
    } else if (typeof user.roles === 'string') {
      const raw = user.roles.trim();
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          userRoles = parsed as string[];
        } else if (typeof parsed === 'string') {
          userRoles = [parsed];
        }
      } catch {
        // Not JSON: accept CSV or single token like "student"
        userRoles = raw.includes(',') ? raw.split(',').map(r => r.trim()).filter(Boolean) : [raw];
      }
    }

    userRoles.forEach((role: any) => {
      const navs = navConfig[role as keyof typeof navConfig];
      if (navs) {
        navs.forEach(nav => {
            const key = (nav as any).id || nav.href;
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
                                variant="outline" 
                                className="w-full justify-between"
                                isActive={pathname?.startsWith(`/admin/${item.id}`) || false}
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
                                {item.subItems.map((subItem: any) => (
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
