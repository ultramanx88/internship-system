'use client';

import { UsersTable } from '@/components/admin/users/UsersTable';
import { StaffGuard } from '@/components/auth/PermissionGuard';

export default function StaffUsersPage() {
    return (
        <StaffGuard>
            <div className="grid gap-8 text-secondary-600">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">ข้อมูลผู้ใช้งาน</h1>
                    <p>จัดการรายละเอียดและข้อมูลส่วนตัวของผู้ใช้ (เหมือนมุมมองผู้ดูแล)</p>
                </div>
                <UsersTable defaultRole="students+educators" lockRole />
            </div>
        </StaffGuard>
    );
}


