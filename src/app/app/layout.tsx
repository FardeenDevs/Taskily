
"use client";

import { AppLayout as AppLayoutClient } from '@/app/main-layout';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // We only want the AppLayoutClient for the core app views
  if (pathname === '/app' || pathname === '/app/notes') {
    return <AppLayoutClient>{children}</AppLayoutClient>;
  }
  
  // For other routes like /app/profile, just render the children
  return <>{children}</>;
}
