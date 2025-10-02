
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
    if (loading) return; // Wait until user status is determined

    if (user && isLoginPage) {
      // User is logged in and on the login page, redirect to home
      router.push('/');
    } else if (!user && !isLoginPage) {
      // User is not logged in and not on the login page, redirect to login
      router.push('/login');
    }
  }, [user, loading, router, pathname, isLoginPage]);

  // If we're on the login page and not logged in, just show the children
  if (isLoginPage && !user) {
    return <>{children}</>;
  }

  // If we are on a protected page and still loading, show a spinner.
  if (loading && !isLoginPage) {
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

  // If we have a user, show the content for any page.
  if (user) {
    return <>{children}</>;
  }
  
  // If we're not logged in and not on the login page, the redirect is in flight.
  // Show a loader to prevent content flash.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
