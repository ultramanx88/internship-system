'use client';

import { useState, useEffect } from 'react';

interface EducatorRole {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  educatorRoleId?: string;
  educatorRole?: EducatorRole;
}

export function useEducatorRole() {
  const [user, setUser] = useState<User | null>(null);
  const [educatorRole, setEducatorRole] = useState<EducatorRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Debug: ตรวจสอบ localStorage
      console.log('🔍 Checking localStorage...');
      const allKeys = Object.keys(localStorage);
      console.log('📋 All localStorage keys:', allKeys);
      
      // ตรวจสอบข้อมูลผู้ใช้จาก localStorage (ใช้ key เดียวกับ use-auth-provider)
      const storedUser = localStorage.getItem('internship-flow-user');
      console.log('👤 Stored user data:', storedUser);
      
      if (!storedUser) {
        console.log('❌ No user data in localStorage');
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      console.log('📝 Parsed user:', parsedUser);
      
      if (!parsedUser || !parsedUser.id) {
        console.log('❌ Invalid user data');
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      // ใช้ข้อมูลจาก localStorage โดยตรง
      setUser(parsedUser);
      console.log('✅ User set successfully:', parsedUser);

      // ถ้ามี educatorRole ให้ตั้งค่า
      if (parsedUser.educatorRole) {
        setEducatorRole(parsedUser.educatorRole);
        console.log('🎭 Educator role set:', parsedUser.educatorRole);
      } else {
        console.log('⚠️ No educator role found in user data');
      }

    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading completed');
    }
  };

  const updateEducatorRole = async (roleId: string) => {
    try {
      if (!user) return;

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educatorRoleId: roleId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update educator role');
      }

      // โหลดข้อมูล role ใหม่
      const roleResponse = await fetch(`/api/educator-roles/${roleId}`);
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setEducatorRole(roleData);
      }

      // อัปเดตข้อมูลผู้ใช้
      await loadUserData();

    } catch (err) {
      console.error('Error updating educator role:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getAvailableRoles = (): EducatorRole[] => {
    // ส่งคืน role ที่ผู้ใช้สามารถเลือกได้
    // ในที่นี้จะส่งคืน role ทั้งหมด แต่ในระบบจริงอาจจะมีการจำกัดตามสิทธิ์
    return [
      {
        id: 'role_instructor',
        name: 'อาจารย์ประจำวิชา',
        nameEn: 'Course Instructor',
        description: 'อาจารย์ที่รับผิดชอบการสอนวิชาเฉพาะ',
        isActive: true
      },
      {
        id: 'role_advisor',
        name: 'อาจารย์นิเทศก์',
        nameEn: 'Academic Advisor',
        description: 'อาจารย์ที่ดูแลและให้คำแนะนำนักศึกษาในการฝึกงาน',
        isActive: true
      },
      {
        id: 'role_committee',
        name: 'กรรมการ',
        nameEn: 'Committee Member',
        description: 'กรรมการที่เกี่ยวข้องกับการประเมินและตัดสินใจ',
        isActive: true
      }
    ];
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    
    // ตรวจสอบจาก roles array
    const userRoles = Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(role => role.trim().replace(/[\[\]"]/g, ''));
    if (userRoles.includes(roleName)) return true;
    
    // ตรวจสอบจาก educatorRole
    if (educatorRole && educatorRole.name === roleName) return true;
    
    return false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('staff');
  };

  const isInstructor = (): boolean => {
    return hasRole('instructor') || hasRole('courseInstructor');
  };

  const isAcademicAdvisor = (): boolean => {
    return hasRole('visitor') || hasRole('academicAdvisor');
  };

  const isCommittee = (): boolean => {
    return hasRole('committee');
  };

  // ตรวจสอบว่าผู้ใช้มีหลาย role หรือไม่
  const hasMultipleRoles = (): boolean => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(role => role.trim().replace(/[\[\]"]/g, ''));
    return userRoles.length > 1;
  };

  // ตรวจสอบสิทธิ์การเข้าถึง
  const canAccessApplications = (): boolean => {
    return hasRole('courseInstructor') || hasRole('committee');
  };

  const canAccessSupervision = (): boolean => {
    return hasRole('visitor') || hasRole('academicAdvisor');
  };

  const canAccessEvaluation = (): boolean => {
    return hasRole('courseInstructor') || hasRole('committee');
  };

  return {
    user,
    educatorRole,
    isLoading,
    error,
    updateEducatorRole,
    getAvailableRoles,
    hasRole,
    isAdmin,
    isInstructor,
    isAcademicAdvisor,
    isCommittee,
    hasMultipleRoles,
    canAccessApplications,
    canAccessSupervision,
    canAccessEvaluation,
    refetch: loadUserData
  };
}
