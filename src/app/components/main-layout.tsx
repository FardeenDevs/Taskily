
"use client";

import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { FirestoreWorkspaceSidebar } from "./firestore-workspace-sidebar";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Settings } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { type useTasks } from "@/lib/hooks/use-tasks";

type MainLayoutProps = {
    children: React.ReactNode;
    tasksHook: ReturnType<typeof useTasks>;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

function Layout({ children, tasksHook, setIsSettingsOpen }: MainLayoutProps) {
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
                            <nav className="flex items-center gap-2 rounded-full bg-secondary p-1">
                                <Link href="/" passHref>
                                    <span className={cn(
                                        "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        pathname === '/' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                                    )}>
                                        Progress
                                    </span>
                                </Link>
                                <Link href="/notes" passHref>
                                    <span className={cn(
                                        "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                                        pathname === '/notes' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                                    )}>
                                        Notes
                                    </span>
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hidden md:inline-flex" onClick={() => setIsSettingsOpen(true)}>
                                <Settings className="h-5 w-5" />
                            </Button>
                            <UserNav />
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


export function MainLayout({ children, tasksHook, setIsSettingsOpen }: MainLayoutProps) {
    return (
        <SidebarProvider>
            <Layout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen}>
                {children}
            </Layout>
        </SidebarProvider>
    )
}
