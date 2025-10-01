import { CompaniesTable } from '@/components/admin/companies/CompaniesTable';
import { SimpleCompaniesTable } from '@/components/admin/companies/SimpleCompaniesTable';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">กำลังโหลดข้อมูลบริษัท...</span>
        </div>
    );
}

export default function CompaniesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">จัดการสถานประกอบการ</h1>
                <p className="text-muted-foreground">จัดการข้อมูลบริษัทและสถานประกอบการ</p>
            </div>
            
            {/* เปลี่ยนกลับเป็น CompaniesTable จริง */}
            <Suspense fallback={<LoadingFallback />}>
                <CompaniesTable />
            </Suspense>
        </div>
    );
}