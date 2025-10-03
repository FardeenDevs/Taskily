
"use client";

import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { FirestoreWorkspaceSidebar } from "./firestore-workspace-sidebar";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { type useTasks } from "@/lib/hooks/use-tasks";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';

type View = 'progress' | 'notes';

type MainLayoutProps = {
    children: React.ReactNode;
    tasksHook: ReturnType<typeof useTasks>;
    setIsSettingsOpen: (isOpen: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
}

function Layout({ children, tasksHook, setIsSettingsOpen, currentView, setCurrentView }: MainLayoutProps) {
    const { toggleSidebar } = useSidebar();
    const pathname = usePathname();

    return (
        <>
            <FirestoreWorkspaceSidebar tasksHook={tasksHook} />
            <SidebarInset>
                <div className="flex flex-col h-screen">
                    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                                <LayoutGrid className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                             <Link href="/" className="flex items-center gap-2 sm:hidden">
                                <svg role="img" viewBox="0 0 24 24" className="h-7 w-7 text-primary">
                                    <title>Listily</title>
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"></path>
                                    <path d="m16.299 7.295-5.294 5.294-2.293-2.293-1.414 1.414 3.707 3.707 6.707-6.707z" fill="currentColor"></path>
                                </svg>
                                <span className="sr-only">Listily</span>
                            </Link>
                            <nav className={cn("relative flex items-center gap-2 rounded-full bg-secondary p-1")}>
                                <span 
                                    onClick={() => setCurrentView('progress')}
                                    className={cn(
                                        "relative z-10 cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        currentView !== 'progress' && "text-muted-foreground hover:text-foreground"
                                    )}>
                                    Progress
                                </span>
                                <span 
                                    onClick={() => setCurrentView('notes')}
                                    className={cn(
                                        "relative z-10 cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        currentView !== 'notes' && "text-muted-foreground hover:text-foreground"
                                    )}>
                                    Notes
                                </span>
                                <AnimatePresence>
                                    {currentView === 'progress' ? (
                                        <motion.div
                                            key="progress-indicator"
                                            layoutId="nav-indicator"
                                            className="absolute left-1 h-[calc(100%-8px)] w-[90px] rounded-full bg-background shadow-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    ) : (
                                        <motion.div
                                            key="notes-indicator"
                                            layoutId="nav-indicator"
                                            className="absolute left-[98px] h-[calc(100%-8px)] w-[75px] rounded-full bg-background shadow-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <UserNav setIsSettingsOpen={setIsSettingsOpen} />
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </SidebarInset>
        </>
    )
}


export function MainLayout({ children, tasksHook, setIsSettingsOpen, currentView, setCurrentView }: MainLayoutProps) {
    return (
        <Layout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen} currentView={currentView} setCurrentView={setCurrentView}>
            {children}
        </Layout>
    )
}
