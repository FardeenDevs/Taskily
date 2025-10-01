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
import { LayoutGrid, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { ThemeProvider } from "@/app/components/theme-provider";
import { type Task, type Workspace } from "@/lib/types";

function AppContent() {
  const {
    tasks: allTasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    isFirstTime,
    setIsFirstTime,
    workspaces,
    activeWorkspace,
    addWorkspace,
    switchWorkspace,
    deleteWorkspace,
    clearTasks,
  } = useTasks();

  const { setOpenMobile: setSidebarOpen } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (activeWorkspace) {
      setCurrentTasks(allTasks.filter(t => activeWorkspace.tasks.some(wt => wt.id === t.id)));
    } else {
      setCurrentTasks([]);
    }
  }, [activeWorkspace, allTasks]);
  
  const completedTasks = useMemo(
    () => currentTasks.filter((task) => task.completed).length,
    [currentTasks]
  );
  
  const totalTasks = useMemo(() => currentTasks.length, [currentTasks]);


  if (loading) {
     return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-2xl space-y-8">
                 <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
        </div>
    );
  }

  return (
      <SidebarInset>
        <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background p-4 sm:p-8 pt-16 sm:pt-24">
           <div className="absolute top-4 left-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={() => setSidebarOpen(true)}>
                            <LayoutGrid className="mr-2"/>
                            Taskspaces
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2"/>
                            Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
          <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onClearTasks={clearTasks} />
          <div className="w-full max-w-2xl">
            <AnimatePresence>
              <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                  <CardHeader>
                     <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground text-center">
                        {activeWorkspace?.name || "Taskily"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        Get things done, one task at a time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <TaskProgress completed={completedTasks} total={totalTasks} />
                    <TaskInput onAddTask={addTask} />
                    <TaskList
                      tasks={currentTasks}
                      onToggleTask={toggleTask}
                      onDeleteTask={deleteTask}
                      onEditTask={editTask}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <TaskSuggestions currentTasks={currentTasks} onAddTask={addTask} />
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </SidebarInset>
  );
}


export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider>
          <Sidebar>
            <WorkspaceSidebarWrapper/>
          </Sidebar>
          <AppContent/>
        </SidebarProvider>
    </ThemeProvider>
  );
}

// We need to wrap the WorkspaceSidebar in a component that uses the useTasks hook
// because the Sidebar component is outside the main AppContent where the hook is used.
function WorkspaceSidebarWrapper() {
    const { workspaces, activeWorkspace, addWorkspace, switchWorkspace, deleteWorkspace } = useTasks();

    if (!workspaces) return null;

    return (
        <WorkspaceSidebar 
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onAddWorkspace={addWorkspace}
          onSwitchWorkspace={switchWorkspace}
          onDeleteWorkspace={deleteWorkspace}
        />
    )
}
