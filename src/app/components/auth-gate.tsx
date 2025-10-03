
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (loading) return; // Wait until loading is complete before doing anything

    // If there's no user, redirect to login from any protected page
    if (!user && !isLoginPage) {
      router.push('/login');
    }
    
    // If the user is logged in, redirect them away from the login page
    if (user && isLoginPage) {
      router.push('/');
    }
  }, [user, loading, router, isLoginPage, pathname]);


  if (loading) {
      // If we are loading, don't show anything to prevent flashes
      return null;
  }

  // If we are waiting for a redirect, render nothing to avoid flashes
  if (!user && !isLoginPage) {
      return null;
  }
  if (user && isLoginPage) {
      return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
