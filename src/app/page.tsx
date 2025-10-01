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
import { Trash2, Settings } from "lucide-react";
import { useState, memo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { ThemeProvider } from "@/app/components/theme-provider";
import { type Task } from "@/lib/types";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AppContentProps {
  tasks: Task[];
  loading: boolean;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newText: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
  clearTasks: () => void;
  completedTasks: number;
  totalTasks: number;
  resetApp: () => void;
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
  clearTasks,
  completedTasks,
  totalTasks,
  resetApp
}: AppContentProps) {
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
      <>
         <div className="absolute top-4 right-4 z-50">
             <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-5 w-5" />
              </Button>
          </div>
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
          <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
          <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onClearAll={resetApp} />
          <div className="w-full max-w-2xl">
              <AnimatePresence>
                <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                    <CardHeader>
                       <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground text-center">
                          Listily
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
                                      This will permanently delete all tasks. This action cannot be undone.
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
      </>
  );
});


export default function Home() {
    const tasksState = useTasks();

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppContent 
                tasks={tasksState.tasks}
                loading={tasksState.loading}
                addTask={tasksState.addTask}
                toggleTask={tasksState.toggleTask}
                deleteTask={tasksState.deleteTask}
                editTask={tasksState.editTask}
                isFirstTime={tasksState.isFirstTime}
                setIsFirstTime={tasksState.setIsFirstTime}
                clearTasks={tasksState.clearTasks}
                resetApp={tasksState.resetApp}
                completedTasks={tasksState.completedTasks}
                totalTasks={tasksState.totalTasks}
            />
        </ThemeProvider>
    );
}
