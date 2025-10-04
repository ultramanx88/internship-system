'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BarChart3,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function RoleSelectorPage() {
  const { user, educatorRole, updateEducatorRole, getAvailableRoles, isLoading } = useEducatorRole();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const availableRoles = getAvailableRoles();

  const handleRoleSelect = async (roleId: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      await updateEducatorRole(roleId);
      
      toast({
        title: 'เปลี่ยนบทบาทสำเร็จ',
        description: 'คุณได้เปลี่ยนบทบาทเรียบร้อยแล้ว',
      });

      // เปลี่ยนไปหน้า dashboard
      router.push('/educator');
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเปลี่ยนบทบาทได้',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'อาจารย์ประจำวิชา':
        return GraduationCap;
      case 'อาจารย์นิเทศ':
        return Users;
      case 'กรรมการ':
        return BarChart3;
      default:
        return GraduationCap;
    }
  };

  const getRoleDescription = (roleName: string) => {
    switch (roleName) {
      case 'อาจารย์ประจำวิชา':
        return 'จัดการงานในฐานะอาจารย์ประจำวิชา รับผิดชอบการสอนและประเมินผลนักศึกษา';
      case 'อาจารย์นิเทศ':
        return 'ดูแลและให้คำแนะนำนักศึกษาในการฝึกงานและสหกิจศึกษา';
      case 'กรรมการ':
        return 'ประเมินผลงานและตัดสินใจในคณะกรรมการ';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          เลือกบทบาทของคุณ
        </h1>
        <p className="text-gray-600 mt-2">
          กรุณาเลือกบทบาทที่คุณต้องการใช้ในระบบ
        </p>
        {educatorRole && (
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              บทบาทปัจจุบัน: {educatorRole.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRoles.map((role) => {
          const Icon = getRoleIcon(role.name);
          const isSelected = selectedRole === role.id;
          const isCurrentRole = educatorRole?.id === role.id;

          return (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              } ${isCurrentRole ? 'border-green-500 bg-green-50' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 w-fit">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{role.name}</CardTitle>
                <CardDescription className="text-sm">
                  {role.nameEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {getRoleDescription(role.name)}
                </p>
                
                {isCurrentRole && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <span>บทบาทปัจจุบัน</span>
                  </div>
                )}

                <Button 
                  className="w-full"
                  variant={isCurrentRole ? "outline" : "default"}
                  disabled={isCurrentRole || isUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelect(role.id);
                  }}
                >
                  {isUpdating && selectedRole === role.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังเปลี่ยน...
                    </>
                  ) : isCurrentRole ? (
                    'บทบาทปัจจุบัน'
                  ) : (
                    'เลือกบทบาทนี้'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Role Info */}
      {educatorRole && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลบทบาทปัจจุบัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ชื่อ:</strong> {educatorRole.name}</p>
              <p><strong>ชื่อภาษาอังกฤษ:</strong> {educatorRole.nameEn}</p>
              <p><strong>คำอธิบาย:</strong> {educatorRole.description}</p>
              <p><strong>สถานะ:</strong> 
                <Badge variant={educatorRole.isActive ? "default" : "secondary"} className="ml-2">
                  {educatorRole.isActive ? 'ใช้งานได้' : 'ไม่ใช้งาน'}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          ย้อนกลับ
        </Button>
        {educatorRole && (
          <Button 
            onClick={() => router.push('/educator')}
          >
            ไปยัง Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
