
"use client";

import { AppLayout as AppLayoutClient } from '@/app/main-layout';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return <AppLayoutClient>{children}</AppLayoutClient>;
}
