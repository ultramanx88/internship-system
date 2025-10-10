import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth-provider';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

// Development helpers
if (process.env.NODE_ENV === 'development') {
  import('@/lib/dev-helpers');
}

export const metadata: Metadata = {
  title: 'Internship',
  description: 'ระบบจัดการการฝึกงานและสหกิจศึกษา',
  applicationName: 'Internship System',
  themeColor: '#ffffff',
  icons: {
    icon: '/assets/images/garuda-logo.png',
    apple: '/assets/images/garuda-logo.png',
    other: [
      { rel: 'mask-icon', url: '/assets/images/garuda-logo.svg', color: '#5bbad5' }
    ]
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </AuthProvider>
        <ServiceWorkerRegistrar />
        <Toaster />
      </body>
    </html>
  );
}
