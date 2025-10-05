import { redirect } from 'next/navigation';

export default function StudentsLegacyRedirectPage() {
    redirect('/staff/users');
}