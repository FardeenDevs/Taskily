
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
    // If auth is not loading and there's no user, redirect to login from a protected page
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
    
    // If the user is logged in, redirect them away from the login page
    if (!loading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, loading, router, isLoginPage, pathname]);

  // While checking auth status, show a spinner to prevent any content flash
  if (loading) {
      return <LoadingSpinner />;
  }

  // If there's no user and we are on a protected page, we render null and wait for redirect
  if (!user && !isLoginPage) {
      return null;
  }
  
  // If there is a user and we are on the login page, render null and wait for redirect
  if (user && isLoginPage) {
      return null;
  }

  // Otherwise, render the children (either the protected page content or the login form)
  return <>{children}</>;
}
