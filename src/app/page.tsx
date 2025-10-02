
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useState, memo, useCallback, useMemo, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageTransition } from "./components/page-transition";
import { MainLayout } from "./components/main-layout";
import { useUser } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Priority, Effort } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const WelcomeDialog = dynamic(() => import('@/app/components/welcome-dialog').then(mod => mod.WelcomeDialog));
const SettingsDialog = dynamic(() => import('@/app/components/settings-dialog').then(mod => mod.SettingsDialog));

const AppContent = memo(function AppContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isBackupCodeDialogOpen, setIsBackupCodeDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [failedPasswordAttempts, setFailedPasswordAttempts] = useState(0);

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
    workspaces,
    appSettings, 
    setAppSettings,
    unlockedWorkspaces,
    unlockWithPassword,
    unlockWithBackupCode,
  } = tasksHook;

  const isLocked = useMemo(() => {
    if (!activeWorkspace) return false;
    return !!activeWorkspace.password && !unlockedWorkspaces.has(activeWorkspace.id);
  }, [activeWorkspace, unlockedWorkspaces]);

  const handleClearTasks = useCallback(() => {
    if (activeWorkspaceId) {
      clearTasks(activeWorkspaceId);
    }
  }, [activeWorkspaceId, clearTasks]);

  const handleAddTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    addTask(text, priority, effort);
  }, [addTask]);

  const handleNotesNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isLocked) {
        setIsUnlockDialogOpen(true);
    } else {
        setIsNavigating(true);
        router.push('/notes');
    }
  };

  const handlePasswordUnlock = async () => {
    if (!activeWorkspace) return;
    const success = await unlockWithPassword(activeWorkspace.id, passwordInput);
    if (success) {
        router.push('/notes');
        setIsUnlockDialogOpen(false);
        setPasswordInput("");
        setShowPassword(false);
        setFailedPasswordAttempts(0);
        toast({ title: "Listspace Unlocked", description: "If you have been redirected to Listily Progress or opening a note has locked you out, please try entering the password again." });
    } else {
        toast({ variant: "destructive", title: "Incorrect Password" });
        setPasswordInput("");
        setFailedPasswordAttempts(prev => prev + 1);
    }
  };

  const handleBackupCodeUnlock = async () => {
    if (!activeWorkspace) return;
     if (await unlockWithBackupCode(activeWorkspace.id, passwordInput)) {
        router.push('/notes');
        setIsBackupCodeDialogOpen(false);
        setPasswordInput("");
        toast({ title: "Listspace Unlocked", description: "Redirecting to Notes..." });
    } else {
        toast({ variant: "destructive", title: "Incorrect or Used Backup Code" });
        setPasswordInput("");
    }
  }

  const onUnlockDialogClose = (open: boolean) => {
    setIsUnlockDialogOpen(open);
    if (!open) {
        setPasswordInput("");
        setShowPassword(false);
        setFailedPasswordAttempts(0);
    }
  }

  const openBackupDialog = () => {
    setIsUnlockDialogOpen(false);
    setPasswordInput("");
    setShowPassword(false);
    setFailedPasswordAttempts(0);
    setIsBackupCodeDialogOpen(true);
  }

  const backToPasswordDialog = () => {
    setIsBackupCodeDialogOpen(false);
    setPasswordInput("");
    setIsUnlockDialogOpen(true);
  }


  if (loading || isNavigating) {
    return (
      <AnimatePresence>
          <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen} setIsNavigating={setIsNavigating} handleNotesNavigation={handleNotesNavigation}>
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
                    <TaskInput 
                      onAddTask={handleAddTask} 
                      defaultPriority={appSettings.defaultPriority}
                      defaultEffort={appSettings.defaultEffort}
                    />
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
      {isFirstTime && <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />}
      {isSettingsOpen && <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        onResetApp={resetApp} 
        onDeleteAccount={deleteAccount} 
        userEmail={user?.email}
        workspaces={workspaces}
        appSettings={appSettings}
        onSettingsChange={setAppSettings}
      />}
       <AlertDialog open={isUnlockDialogOpen} onOpenChange={onUnlockDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Notes</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password for "{activeWorkspace?.name}" to view its notes.
              {activeWorkspace?.passwordHint && failedPasswordAttempts >= 3 && (
                <div className="text-xs text-muted-foreground mt-2">Hint: {activeWorkspace.passwordHint}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-3">
            <Label htmlFor="password-unlock" className="sr-only">Password</Label>
            <div className="relative">
                <Input 
                    id="password-unlock" 
                    type={showPassword ? "text" : "password"}
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordUnlock()}
                    placeholder="Enter password..." 
                />
                 <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={openBackupDialog}>
                Forgot Password?
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordUnlock}>Unlock and Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBackupCodeDialogOpen} onOpenChange={setIsBackupCodeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Backup Code</AlertDialogTitle>
            <AlertDialogDescription>
              Enter one of your 6-character backup codes to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="backup-code-unlock" className="sr-only">Backup Code</Label>
            <Input 
                id="backup-code-unlock" 
                type="text" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBackupCodeUnlock()}
                placeholder="Enter backup code..." 
            />
          </div>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={backToPasswordDialog}>Back to Password</Button>
            <AlertDialogAction onClick={handleBackupCodeUnlock}>Unlock and Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default function Home() {
  return (
      <AppContent />
  );
}
