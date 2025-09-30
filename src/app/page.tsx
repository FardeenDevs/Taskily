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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  
  const getInitials = (email?: string | null) => {
    if (!email) return "?";
    return email.substring(0, 2).toUpperCase();
  }

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
                    {user?.displayName ? `Welcome back, ${user.displayName}!` : 'Get things done, one task at a time.'}
                  </CardDescription>
                </div>
                 {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.uid}`} alt={user.displayName || user.email || ''} />
                                <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                            </Avatar>
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
