
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/app/components/theme-provider';
import { ClientProviders } from '@/app/components/client-providers';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Listily',
  description: 'Get things done, one task at a time.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-primary">
            <title>Listily</title>
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
              fill="currentColor"
            ></path>
            <path
              d="m16.299 7.295-5.294 5.294-2.293-2.293-1.414 1.414 3.707 3.707 6.707-6.707z"
              fill="currentColor"
            ></path>
          </svg>
      </head>
      <body className="font-body antialiased bg-app-gradient">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <ClientProviders>
                {children}
            </ClientProviders>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
