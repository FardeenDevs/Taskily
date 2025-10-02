
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, LayoutGrid, Trash2 } from "lucide-react";
import { useState, memo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Button } from "@/components/ui/button";
import { FirestoreWorkspaceSidebar } from "@/app/components/firestore-workspace-sidebar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { AuthGate } from "./components/auth-gate";
import { UserNav } from "./components/user-nav";

const AppContent = memo(function AppContent() {
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setOpen: setSidebarOpen } = useSidebar();
  const pathname = usePathname();

  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    completedTasks,
    totalTasks,
    activeWorkspace,
    activeWorkspaceId,
    isFirstTime,
    setIsFirstTime,
    resetApp,
    clearTasks,
  } = tasksHook;

  const handleClearTasks = () => {
    if (activeWorkspaceId) {
      clearTasks(activeWorkspaceId);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl space-y-8">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <SidebarInset>
        <FirestoreWorkspaceSidebar tasksHook={tasksHook} />
        <header className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                 <div className="z-50 md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem onClick={() => setSidebarOpen(true)}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            <span>Listspaces</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            
                <div className="hidden md:block">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-center text-foreground">Listily</h1>
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
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                </Button>
                <UserNav />
            </div>
        </header>

      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 pt-0 sm:p-8 sm:pt-0">
        <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} />
        
        <div className="w-full max-w-2xl">
          <AnimatePresence>
            <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-center gap-2">
                        <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground text-center">
                            {activeWorkspace?.name || "My List"}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                      <TaskProgress completed={completedTasks} total={totalTasks} />
                      <TaskInput onAddTask={addTask} />
                      <TaskList
                        tasks={tasks}
                        onToggleTask={toggleTask}
                        onDeleteTask={deleteTask}
                        onEditTask={editTask}
                      />
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={tasks.length === 0}
                          className="disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear All Tasks
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all tasks in this list. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearTasks} variant="destructive">
                            Yes, clear all
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  <TaskSuggestions currentTasks={tasks} onAddTask={(text) => addTask(text, null, null)} />
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </SidebarInset>
  );
});

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthGate>
            <SidebarProvider>
                <AppContent />
            </SidebarProvider>
        </AuthGate>
    </ThemeProvider>
  );
}
