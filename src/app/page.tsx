
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { Settings, LayoutGrid, Trash2 } from "lucide-react";
import { useState, memo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { FirestoreWorkspaceSidebar } from "@/app/components/firestore-workspace-sidebar";
import { SidebarInset, useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { UserNav } from "./components/user-nav";
import { PageTransition } from "./components/page-transition";

const AppContent = memo(function AppContentInternal() {
  const tasksHook = useTasks();
  const { toggleSidebar } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    deleteAccount,
    clearTasks,
  } = tasksHook;

  const handleClearTasks = () => {
    if (activeWorkspaceId) {
      clearTasks(activeWorkspaceId);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <FirestoreWorkspaceSidebar tasksHook={tasksHook} />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b">
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
            <div className="mx-auto max-w-5xl w-full h-full p-4 sm:p-8">
              <PageTransition>
                <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-center gap-2">
                      <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground text-center">
                        {activeWorkspace?.name || "My List"}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 flex-grow overflow-y-auto p-6 pt-0">
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
                  <CardFooter className="flex items-center justify-between flex-shrink-0">
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
              </PageTransition>
            </div>
          </main>
        </div>
      </SidebarInset>
      <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} onDeleteAccount={deleteAccount} />
    </>
  );
});

export default function Home() {
  return (
      <AppContent />
  );
}
