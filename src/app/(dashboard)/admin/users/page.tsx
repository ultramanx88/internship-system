import { UsersTable } from '@/components/admin/users/UsersTable';

export default function AdminUsersPage() {
    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">จัดการรายชื่อผู้ใช้</h1>
                <p>เพิ่ม แก้ไข และจัดการข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
            </div>
            <UsersTable />
        </div>
    );
}
