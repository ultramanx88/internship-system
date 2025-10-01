'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SimpleCompaniesTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>รายชื่อสถานประกอบการ (Simple Version)</CardTitle>
            </CardHeader>
            <CardContent>
                <p>หน้านี้ทำงานแล้ว! ถ้าเห็นข้อความนี้แสดงว่า component render ได้</p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p>ขั้นตอนต่อไป:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>ทดสอบ API ที่ /admin/companies/test</li>
                        <li>ตรวจสอบ Console ใน Developer Tools</li>
                        <li>แก้ไข CompaniesTable component</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}