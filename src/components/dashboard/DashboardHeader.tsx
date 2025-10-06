'use client';

import { useAuth } from '@/hooks/use-auth';
import { useProfileImage } from '@/hooks/use-profile-image';
import { useSystemLogo } from '@/hooks/use-system-logo';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { roles as roleData } from '@/lib/permissions';
import { LogOut, User as UserIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
  const { user, loading, logout } = useAuth();
  const { profileImage } = useProfileImage();
  const { systemLogo } = useSystemLogo();
  const pathname = usePathname();
  const resolveSettingsPath = () => {
    const rawRoles: any = user?.roles;
    const roles: string[] = Array.isArray(rawRoles)
      ? rawRoles
      : (rawRoles ? (() => { try { return JSON.parse(rawRoles); } catch { return []; } })() : []);
    const currentRole: string | undefined = (user as any)?.currentRole || roles[0];

    // Prefer currentRole; fallback by role precedence
    const has = (r: string) => roles.includes(r);
    const role = currentRole || (has('admin') ? 'admin' : has('staff') ? 'staff' : has('courseInstructor') || has('committee') ? 'educator' : 'student');

    if (role === 'admin') return '/admin/settings';
    if (role === 'staff') return '/staff/settings';
    if (role === 'courseInstructor' || role === 'committee') return '/educator/settings';
    return '/student/settings';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const getRoleLabelForContext = (): string => {
    // Prioritize current route section to determine visible role context
    if (pathname?.startsWith('/admin')) return 'ผู้ดูแลระบบ';
    if (pathname?.startsWith('/staff')) return 'ธุรการ';
    if (pathname?.startsWith('/educator')) return 'อาจารย์';
    if (pathname?.startsWith('/student')) return 'นักศึกษา';

    // Fallback to currentRole/roles of user
    const rawRoles: any = user?.roles;
    const roles: string[] = Array.isArray(rawRoles)
      ? rawRoles
      : (rawRoles ? (() => { try { return JSON.parse(rawRoles); } catch { return []; } })() : []);
    const currentRole: string | undefined = (user as any)?.currentRole || roles[0];
    const map: Record<string, string> = roleData.reduce((acc, r) => { acc[r.id] = r.label; return acc; }, {} as Record<string, string>);
    if (currentRole === 'นักศึกษา' || currentRole === 'ธุรการ') return currentRole;
    return map[currentRole || 'student'] || currentRole || 'student';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex flex-1 items-center justify-end">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            {/* แสดงชื่อและรหัส โดยเลือกชื่อจากข้อมูลไทย/อังกฤษที่มี */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none text-gray-900">
                {(() => {
                  const u: any = user;
                  const thai = [u.t_title, u.t_name, u.t_middle_name, u.t_surname].filter(Boolean).join(' ').trim();
                  const eng = [u.e_title, u.e_name, u.e_middle_name, u.e_surname].filter(Boolean).join(' ').trim();
                  return thai || eng || user.name || user.id;
                })()}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {getRoleLabelForContext()} • {user.id}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profileImage || `https://avatar.vercel.sh/${user.email}.png`} 
                      alt={user.name} 
                    />
                    <AvatarFallback>
                      <img 
                        src={systemLogo} 
                        alt="System Logo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="hidden">{getInitials(user.name)}</span>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={resolveSettingsPath()}>
                  <div className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>โปรไฟล์</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
    </header>
  );
}
