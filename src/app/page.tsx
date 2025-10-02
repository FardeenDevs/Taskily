
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { Trash2 } from "lucide-react";
import { useState, memo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageTransition } from "./components/page-transition";
import { MainLayout } from "./components/main-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";

const AppContent = memo(function AppContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      <AnimatePresence>
          <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen}>
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
      </MainLayout>
      <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        onResetApp={resetApp} 
        onDeleteAccount={deleteAccount} 
        userEmail={user?.email}
      />
    </>
  );
});

export default function Home() {
  return (
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
  );
}
