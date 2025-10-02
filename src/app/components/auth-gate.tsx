
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
    if (loading) {
      return; // Wait until loading is false before making any decisions
    }

    if (user && isLoginPage) {
      // If we have a user and they are on the login page, redirect them away.
      router.push('/');
    } else if (!user && !isLoginPage) {
      // If we have no user and they are not on the login page, redirect them there.
      router.push('/login');
    }
  }, [user, loading, router, isLoginPage]);

  // If we are on the login page, always render the children.
  // The useEffect above will handle redirecting away if a user is found.
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // If we are on a protected page, and still loading, show a spinner.
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

  // If we have a user and are not on the login page, show the content.
  if (user) {
    return <>{children}</>;
  }

  // If we have no user and are not on the login page, a redirect is in progress.
  // Show a loader to prevent flashing content.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
