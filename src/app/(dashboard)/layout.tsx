import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { AuthRedirect } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AuthRedirect>
        <Sidebar>
          <DashboardSidebar />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </SidebarInset>
      </AuthRedirect>
    </SidebarProvider>
  );
}
