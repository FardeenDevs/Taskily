"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
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
  } = useTasks();

  const { user } = useAuth();
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth);
  };

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
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
      <div className="w-full max-w-2xl">
        <AnimatePresence>
          <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground">
                    Taskily
                  </CardTitle>
                  <CardDescription>
                    {user ? `Welcome back, ${user.email}!` : 'Get things done, one task at a time.'}
                  </CardDescription>
                </div>
                 {user && (
                  <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                    <LogOut className="h-5 w-5" />
                  </Button>
                )}
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
  );
}
