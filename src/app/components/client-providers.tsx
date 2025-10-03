
'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Dynamically import FirebaseClientProvider to ensure it only runs on the client
const FirebaseClientProvider = dynamic(
  () => import('@/firebase').then((mod) => mod.FirebaseClientProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
        {children}
        <FirebaseErrorListener />
    </FirebaseClientProvider>
  );
}
