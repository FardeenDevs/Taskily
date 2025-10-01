"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/app/components/workspace-sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    completedTasks,
    totalTasks,
    isFirstTime,
    setIsFirstTime,
    workspaces,
    activeWorkspace,
    addWorkspace,
    switchWorkspace,
    deleteWorkspace,
  } = useTasks();

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
    <SidebarProvider>
      <Sidebar>
        <WorkspaceSidebar 
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onAddWorkspace={addWorkspace}
          onSwitchWorkspace={switchWorkspace}
          onDeleteWorkspace={deleteWorkspace}
        />
      </Sidebar>
      <SidebarInset>
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
          <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
          <div className="w-full max-w-2xl">
            <AnimatePresence>
              <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground">
                                {activeWorkspace?.name || "Taskily"}
                            </CardTitle>
                            <CardDescription>
                                Get things done, one task at a time.
                            </CardDescription>
                        </div>
                        <SidebarTrigger />
                    </div>
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
                  <CardFooter className="flex justify-end">
                    <TaskSuggestions currentTasks={tasks} onAddTask={addTask} />
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
