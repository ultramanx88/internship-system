'use client';

import { UsersTable } from '@/components/admin/users/UsersTable';

export default function StudentsPage() {
	return (
		<div className="grid gap-8 text-secondary-600">
			<div>
				<h1 className="text-3xl font-bold gradient-text">จัดการรายชื่อนักศึกษา</h1>
				<p>เพิ่ม แก้ไข นำเข้า/ลบ และค้นหารายชื่อนักศึกษา (มุมมองเดียวกับผู้ดูแล)</p>
			</div>
			<UsersTable defaultRole="student" lockRole />
		</div>
	);
}