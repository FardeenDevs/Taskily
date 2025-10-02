
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until user status is determined

    const isLoginPage = pathname === '/login';

    if (user && isLoginPage) {
      // User is logged in and on the login page, redirect to home
      router.push('/');
    } else if (!user && !isLoginPage) {
      // User is not logged in and not on the login page, redirect to login
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

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

  // If user is logged in, show the children for any page
  // If user is not logged in, only show children if it's the login page
  if (user || pathname === '/login') {
    return <>{children}</>;
  }
  
  // In the case where the user is not logged in and not on the login page,
  // the useEffect above has already started the redirect. We can return a loader
  // here as well to prevent a flash of unstyled content.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
