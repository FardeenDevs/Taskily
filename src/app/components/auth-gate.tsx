
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // This effect handles redirecting users based on their auth state.
    // It's crucial to wait for the loading to finish before making decisions.
    if (loading) {
      return; 
    }

    // If a logged-in user lands on the login page, redirect them to the home page.
    if (user && isLoginPage) {
      router.push('/');
    }
    
    // If a user is not logged in and is NOT on the login page, redirect them there.
    if (!user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, router, isLoginPage, pathname]);

  // If we are on the login page, we render the content (the login form) immediately.
  // The useEffect above will handle redirecting away if a user session is found.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If loading is not finished AND we are on a protected page, show a loader.
  if (loading) {
     return (
        <AnimatePresence>
            <motion.div
                key="loader"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            >
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </motion.div>
        </AnimatePresence>
    );
  }

  // If loading is finished and we have a user on a protected page, show the content.
  if (user) {
    return <>{children}</>;
  }

  // If loading is finished, there's no user, and we're on a protected page,
  // a redirect to /login is in progress. Show a loader to prevent content flash.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
