"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { WorkspaceSidebar } from "@/app/components/workspace-sidebar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface AppContentProps {
  tasksHook: ReturnType<typeof useTasks>;
}

const AppContent = memo(function AppContent({ tasksHook }: AppContentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setOpen: setSidebarOpen, toggleSidebar } = useSidebar();

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
       <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

       <div className="absolute top-4 left-4 z-50 md:hidden">
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
      
        <div className="absolute top-4 left-4 z-10 hidden md:block">
           <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <LayoutGrid className="h-5 w-5" />
            </Button>
        </div>

      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} />
        <div className="w-full max-w-2xl">
          <AnimatePresence>
            <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground text-center pt-10">
                    {activeWorkspace?.name || "Listily"}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Get things done, one task at a time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <TaskProgress completed={completedTasks} total={totalTasks} />
                  <TaskInput onAddTask={addTask} />
                  <TaskList
                    tasks={tasks}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    onEditTask={editTask}
                  />
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
                          <AlertDialogAction onClick={handleClearTasks} className="bg-red-600 hover:bg-red-700 text-white">
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
  const tasksHook = useTasks();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <WorkspaceSidebar tasksHook={tasksHook} />
        <AppContent tasksHook={tasksHook} />
      </SidebarProvider>
    </ThemeProvider>
  );
}