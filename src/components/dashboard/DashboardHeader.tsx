'use client';

import { useAuth } from '@/hooks/use-auth';
import { useProfileImage } from '@/hooks/use-profile-image';
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
import { LogOut, User as UserIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
  const { user, loading, logout } = useAuth();
  const { profileImage } = useProfileImage();
  const pathname = usePathname();

  const resolveSettingsPath = () => {
    if (!pathname) return '/student/settings';
    if (pathname.startsWith('/admin')) return '/admin/settings';
    if (pathname.startsWith('/staff')) return '/staff/settings';
    if (pathname.startsWith('/educator')) return '/educator/settings';
    if (pathname.startsWith('/student')) return '/student/settings';
    return '/student/settings';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
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
            {/* แสดงรหัสนักศึกษาและชื่อ */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none text-gray-900">
                {user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {user.id}
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
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
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
