import { EditCompanyForm } from '@/components/admin/companies/EditCompanyForm';

interface CompanyEditPageProps {
    params: {
        id: string;
    };
}

export default function CompanyEditPage({ params }: CompanyEditPageProps) {
    return (
        <div className="container mx-auto py-6">
            <EditCompanyForm companyId={params.id} />
        </div>
    );
}