'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, User, GraduationCap, Users, Eye, FileText, Shield } from 'lucide-react';
import { Role } from '@prisma/client';

const roleConfig = {
  student: {
    label: 'นักศึกษา',
    icon: GraduationCap,
    color: 'bg-blue-500'
  },
  courseInstructor: {
    label: 'อาจารย์ประจำวิชา',
    icon: User,
    color: 'bg-green-500'
  },
  committee: {
    label: 'กรรมการ',
    icon: Users,
    color: 'bg-purple-500'
  },
  visitor: {
    label: 'อาจารย์นิเทศ',
    icon: Eye,
    color: 'bg-orange-500'
  },
  staff: {
    label: 'เจ้าหน้าที่ธุรการ',
    icon: FileText,
    color: 'bg-yellow-500'
  },
  admin: {
    label: 'ผู้ดูแลระบบ',
    icon: Shield,
    color: 'bg-red-500'
  }
};

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  
  if (!user || !user.roles || user.roles.length <= 1) {
    return null;
  }

  const currentRole = user.currentRole || user.roles[0];
  const currentConfig = roleConfig[currentRole];
  const CurrentIcon = currentConfig?.icon || User;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <div className={`w-4 h-4 ${currentConfig?.color} rounded-full flex items-center justify-center`}>
            <CurrentIcon className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden sm:inline">{currentConfig?.label}</span>
          <Badge variant="secondary" className="hidden md:inline">
            {currentRole}
          </Badge>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>เปลี่ยนบทบาท</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.roles.map((role) => {
          const config = roleConfig[role];
          if (!config) return null;
          
          const Icon = config.icon;
          const isActive = role === currentRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => switchRole(role)}
              className={`flex items-center gap-3 ${isActive ? 'bg-accent' : ''}`}
            >
              <div className={`w-4 h-4 ${config.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
              {isActive && (
                <Badge variant="default" className="ml-auto text-xs">
                  ปัจจุบัน
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}