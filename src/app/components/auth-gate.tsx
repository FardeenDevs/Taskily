
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
      return; 
    }

    if (user && isLoginPage) {
      router.push('/');
    }
    
    if (!user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, router, isLoginPage, pathname]);
  
  if (isLoginPage) {
    // If on the login page, always render the content immediately.
    // The useEffect handles redirecting away if a user session is found.
    return <>{children}</>;
  }

  if (loading || !user) {
     // For any other page, if we're loading or there's no user, show a loader.
     // The useEffect will handle the redirect to /login if there's no user.
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

  // If we are on a protected page and have a user, show the content.
  return <>{children}</>;
}
