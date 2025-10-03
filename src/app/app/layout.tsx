
"use client";

import { AppLayout as AppLayoutClient } from '@/app/main-layout';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
