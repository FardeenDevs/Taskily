
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
    // Wait until the authentication status is determined
    if (loading) {
      return; 
    }

    // If the user is logged in, redirect them away from the login page
    if (user && isLoginPage) {
      router.push('/');
    }
    
    // If the user is not logged in, redirect them to the login page from any other page
    if (!user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, router, isLoginPage, pathname]);

  // While loading, or if the user is not authenticated and not on the login page,
  // render nothing to prevent a flash of unauthenticated content.
  // The useEffect will handle the redirect.
  if (loading || (!user && !isLoginPage)) {
    return null;
  }

  // If the user is logged in, or if they are on the login page, render the children.
  return <>{children}</>;
}
