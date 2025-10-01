"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/app/components/workspace-sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, Menu, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, memo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { ThemeProvider } from "@/app/components/theme-provider";
import { type Task, type Workspace } from "@/lib/types";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AppContentProps {
  tasks: Task[];
  loading: boolean;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newText: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
  activeWorkspace: Workspace | null;
  clearTasks: () => void;
  completedTasks: number;
  totalTasks: number;
  clearAllWorkspaces: () => void;
}


const AppContent = memo(function AppContent({
  tasks,
  loading,
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  isFirstTime,
  setIsFirstTime,
  activeWorkspace,
  clearTasks,
  completedTasks,
  totalTasks,
  clearAllWorkspaces
}: AppContentProps) {
  const { setOpen: setSidebarOpen } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
        <header className="absolute top-0 left-0 right-0 z-10 flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Listily</h1>
        </header>
        <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 sm:p-8 pt-24 sm:pt-24">
           <div className="absolute top-4 left-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={() => setSidebarOpen(true)}>
                            <LayoutGrid className="mr-2"/>
                            Listspaces
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2"/>
                            Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hidden md:flex" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
          <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
          <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onClearAll={clearAllWorkspaces} />
          <div className="w-full max-w-2xl">
            <AnimatePresence>
              <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                  <CardHeader>
                     <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground text-center">
                        {activeWorkspace?.name || "General"}
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
                           <Button variant="destructiveGradient" size="sm" disabled={tasks.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Clear All Tasks
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all tasks in the "{activeWorkspace?.name}" Listspace. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearTasks} className="bg-red-600 hover:bg-red-700 text-white">
                                    Yes, delete all tasks
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <TaskSuggestions currentTasks={tasks} onAddTask={addTask} />
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
    const tasksState = useTasks();

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
                <Sidebar>
                    {tasksState.workspaces && (
                         <WorkspaceSidebar 
                            workspaces={tasksState.workspaces}
                            activeWorkspace={tasksState.activeWorkspace}
                            onAddWorkspace={tasksState.addWorkspace}
                            onSwitchWorkspace={tasksState.switchWorkspace}
                            onDeleteWorkspace={tasksState.deleteWorkspace}
                        />
                    )}
                </Sidebar>
                <AppContent 
                    tasks={tasksState.tasks}
                    loading={tasksState.loading}
                    addTask={tasksState.addTask}
                    toggleTask={tasksState.toggleTask}
                    deleteTask={tasksState.deleteTask}
                    editTask={tasksState.editTask}
                    isFirstTime={tasksState.isFirstTime}
                    setIsFirstTime={tasksState.setIsFirstTime}
                    activeWorkspace={tasksState.activeWorkspace}
                    clearTasks={tasksState.clearTasks}
                    clearAllWorkspaces={tasksState.clearAllWorkspaces}
                    completedTasks={tasksState.completedTasks}
                    totalTasks={tasksState.totalTasks}
                />
            </SidebarProvider>
        </ThemeProvider>
    );
}
