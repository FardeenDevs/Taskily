
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    if (loading) return; // Wait until loading is complete before doing anything
    
    // If not logged in and not on a public page, redirect to login
    if (!user && !isAuthPage && !isLandingPage) {
      router.push('/login');
    }
    
    // If logged in and on the login page, redirect to the app
    if (user && isAuthPage) {
      router.push('/app');
    }
  }, [user, loading, router, isAuthPage, isLandingPage, pathname]);


  if (loading && !isLandingPage) {
      // If we are loading and not on the landing page, don't show anything to prevent flashes
      return null;
  }

  // If we are waiting for a redirect, render nothing to avoid flashes
  if (!user && !isAuthPage && !isLandingPage) {
      return null;
  }
  if (user && isAuthPage) {
      return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
