import { EditCompanyForm } from '@/components/admin/companies/EditCompanyForm';

interface CompanyEditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CompanyEditPage({ params }: CompanyEditPageProps) {
    const { id } = await params;
    return (
        <div className="container mx-auto py-6">
            <EditCompanyForm companyId={id} />
        </div>
    );
}