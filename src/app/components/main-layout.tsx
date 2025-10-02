
"use client";

import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { FirestoreWorkspaceSidebar } from "./firestore-workspace-sidebar";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { type useTasks } from "@/lib/hooks/use-tasks";
import { usePathname } from "next/navigation";

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
                            <h1 className="text-2xl font-bold text-center text-foreground hidden sm:block">Listily</h1>
                            <nav className={cn(
                                "flex items-center gap-2 rounded-full bg-secondary p-1",
                                pathname === '/profile' && 'invisible' // Hide on profile page
                            )}>
                                <span 
                                    onClick={() => setCurrentView('progress')}
                                    className={cn(
                                        "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        currentView === 'progress' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                                    )}>
                                    Progress
                                </span>
                                <span 
                                    onClick={() => setCurrentView('notes')}
                                    className={cn(
                                        "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        currentView === 'notes' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                                    )}>
                                    Notes
                                </span>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <UserNav setIsSettingsOpen={setIsSettingsOpen} />
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto">
                        {children}
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


