"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
