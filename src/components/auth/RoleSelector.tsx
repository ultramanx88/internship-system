'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, Users, Eye, FileText, Shield } from 'lucide-react';
import { Role } from '@prisma/client';

type RoleSelectorProps = {
  userRoles: Role[];
  userName: string;
  onRoleSelect: (role: Role) => void;
};

const roleConfig = {
  student: {
    label: 'นักศึกษา',
    description: 'เข้าถึงระบบสมัครฝึกงานและติดตามสถานะ',
    icon: GraduationCap,
    color: 'bg-blue-500',
    route: '/student'
  },
  courseInstructor: {
    label: 'อาจารย์ประจำวิชา',
    description: 'จัดการรายวิชาและประเมินนักศึกษา',
    icon: User,
    color: 'bg-green-500',
    route: '/educator'
  },
  'อาจารย์ประจำวิชา': {
    label: 'อาจารย์ประจำวิชา',
    description: 'จัดการรายวิชาและประเมินนักศึกษา',
    icon: User,
    color: 'bg-green-500',
    route: '/educator'
  },
  committee: {
    label: 'กรรมการ',
    description: 'พิจารณาและอนุมัติใบสมัครฝึกงาน',
    icon: Users,
    color: 'bg-purple-500',
    route: '/educator'
  },
  'กรรมการ': {
    label: 'กรรมการ',
    description: 'พิจารณาและอนุมัติใบสมัครฝึกงาน',
    icon: Users,
    color: 'bg-purple-500',
    route: '/educator'
  },
  visitor: {
    label: 'อาจารย์นิเทศก์',
    description: 'นิเทศและติดตามนักศึกษาฝึกงาน',
    icon: Eye,
    color: 'bg-orange-500',
    route: '/educator'
  },
  'อาจารย์นิเทศก์': {
    label: 'อาจารย์นิเทศก์',
    description: 'นิเทศและติดตามนักศึกษาฝึกงาน',
    icon: Eye,
    color: 'bg-orange-500',
    route: '/educator'
  },
  staff: {
    label: 'เจ้าหน้าที่ธุรการ',
    description: 'จัดการเอกสารและข้อมูลทั่วไป',
    icon: FileText,
    color: 'bg-yellow-500',
    route: '/admin'
  },
  admin: {
    label: 'ผู้ดูแลระบบ',
    description: 'จัดการระบบและผู้ใช้งานทั้งหมด',
    icon: Shield,
    color: 'bg-red-500',
    route: '/admin'
  }
};

export function RoleSelector({ userRoles, userName, onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const router = useRouter();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    onRoleSelect(role);
    
    // Navigate to appropriate dashboard
    const config = roleConfig[role];
    if (config) {
      router.push(config.route);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ยินดีต้อนรับ, {userName}!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            คุณมีหลายบทบาทในระบบ กรุณาเลือกบทบาทที่ต้องการใช้งาน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRoles.map((role) => {
            const config = roleConfig[role];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <Card 
                key={role}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
                onClick={() => handleRoleSelect(role)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {role}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm">
                    {config.description}
                  </CardDescription>
                  <Button 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(role);
                    }}
                  >
                    เข้าใช้งานในฐานะ {config.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}