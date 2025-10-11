
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/app/components/theme-provider';
import { ClientProviders } from '@/app/components/client-providers';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


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
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <head>
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
