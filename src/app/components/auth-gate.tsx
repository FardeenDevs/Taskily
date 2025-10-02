
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (loading) {
      return; 
    }

    if (user && isLoginPage) {
      router.push('/');
    }
    
    if (!user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, router, isLoginPage, pathname]);

  if (loading && !isLoginPage) {
    // Return null to prevent rendering children on protected pages while loading,
    // but don't show a spinner.
    return null;
  }
  
  if (!user && !isLoginPage) {
    // Return null for protected pages when there is no user,
    // useEffect will handle the redirect.
    return null;
  }

  return <>{children}</>;
}
