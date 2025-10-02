
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const wipeVariants = {
    initial: (direction: 'left' | 'right') => ({
        x: direction === 'right' ? '-100%' : '100%',
        zIndex: 20,
    }),
    animate: {
        x: '0%',
        zIndex: 20,
        transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exit: (direction: 'left' | 'right') => ({
        x: direction === 'right' ? '100%' : '-100%',
        zIndex: 20,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 }
    })
};

let lastPathname = '';

export function PageTransitionOverlay() {
    const pathname = usePathname();
    const direction = pathname.length > (lastPathname.length || 0) ? 'right' : 'left';
    lastPathname = pathname;
    
    // We only want this transition between the main pages
    const isMainPageTransition = (pathname === '/' && lastPathname === '/notes') || (pathname === '/notes' && lastPathname === '/');
    
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                className="pointer-events-none"
            >
                {isMainPageTransition && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-screen bg-background origin-center"
                        custom={direction}
                        variants={wipeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
