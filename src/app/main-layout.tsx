
"use client";

import { use, useEffect, useState } from "react";
import { useTasks as useTasksClient } from "@/lib/hooks/use-tasks";
import { useUser } from "@/firebase";
import { MainLayout as MainLayoutComponent } from "./components/main-layout";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BackupCodesDialog } from "@/components/ui/backup-codes-dialog";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldQuestion, AlertTriangle } from "lucide-react";

type useTasksType = ReturnType<typeof useTasksClient>;
const TasksContext = React.createContext<useTasksType | null>(null);

export const useTasks = () => {
    const context = use(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a AppLayout");
    }
    return context;
}

const WelcomeDialog = dynamic(() => import('@/app/components/welcome-dialog').then(mod => mod.WelcomeDialog));
const SettingsDialog = dynamic(() => import('@/app/components/settings-dialog').then(mod => mod.SettingsDialog));

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const tasksHook = useTasksClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
      loading, 
      isFirstTime, 
      setIsFirstTime, 
      resetApp, 
      deleteAccount, 
      workspaces, 
      appSettings, 
      setAppSettings,
      backupCodes,
      clearBackupCodes,
      activeWorkspace,
      unlockWithPassword,
      unlockWithBackupCode,
    } = tasksHook;

  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isBackupCodeDialogOpen, setIsBackupCodeDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [backupCodeInput, setBackupCodeInput] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (!loading && activeWorkspace?.isLocked) {
      setIsUnlockDialogOpen(true);
    } else {
      setIsUnlockDialogOpen(false);
    }
  }, [activeWorkspace?.isLocked, loading]);

  const handlePasswordUnlock = async () => {
    if (!activeWorkspace) return;
    setIsUnlocking(true);
    const success = await unlockWithPassword(activeWorkspace.id, passwordInput);
    if (success) {
      toast({ title: "Listspace Unlocked!" });
      setIsUnlockDialogOpen(false);
      setPasswordInput("");
    } else {
      toast({ variant: "destructive", title: "Incorrect Password" });
    }
    setIsUnlocking(false);
  };
  
  const handleBackupCodeUnlock = async () => {
    if (!activeWorkspace) return;
    setIsUnlocking(true);
    const success = await unlockWithBackupCode(activeWorkspace.id, backupCodeInput);
    if (success) {
        toast({ title: "Listspace Unlocked!" });
        setIsBackupCodeDialogOpen(false);
        setIsUnlockDialogOpen(false); // Close the main dialog too
        setBackupCodeInput("");
    } else {
        toast({ variant: "destructive", title: "Invalid Backup Code" });
    }
    setIsUnlocking(false);
  };


  const handleNotesNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/notes') return; // Do nothing if already on notes page
    router.push('/notes');
  };

  const isWorkspaceLocked = !loading && activeWorkspace?.isLocked;

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
    <TasksContext.Provider value={tasksHook}>
        <MainLayoutComponent 
            tasksHook={tasksHook} 
            setIsSettingsOpen={setIsSettingsOpen} 
            handleNotesNavigation={handleNotesNavigation}
        >
          {isWorkspaceLocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Listspace Locked</h2>
                    <p className="mt-2 text-sm text-muted-foreground">This listspace is password protected.</p>
                    <Button className="mt-4" onClick={() => setIsUnlockDialogOpen(true)}>Unlock</Button>
                </div>
            </div>
          )}
          <div className={isWorkspaceLocked ? 'blur-sm' : ''}>
            {children}
          </div>
        </MainLayoutComponent>

        {isFirstTime && <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />}
        {backupCodes && <BackupCodesDialog open={!!backupCodes} onOpenChange={clearBackupCodes} codes={backupCodes} />}
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

        <Dialog open={isUnlockDialogOpen} onOpenChange={(open) => !open && activeWorkspace?.isLocked && setIsUnlockDialogOpen(true)}>
            <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle>Unlock "{activeWorkspace?.name}"</DialogTitle>
                <DialogDescription>
                    Enter the password for this listspace to continue.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="relative">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordUnlock()}
                        placeholder="Enter password"
                        className="pr-10"
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-6 h-7 w-7" 
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                {activeWorkspace?.passwordHint && (
                     <Alert variant="default" className="border-blue-500/50 text-blue-800 dark:text-blue-300">
                        <ShieldQuestion className="h-4 w-4 !text-blue-500" />
                        <AlertTitle>Password Hint</AlertTitle>
                        <AlertDescription>
                            {activeWorkspace.passwordHint}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter className="justify-between sm:justify-between w-full flex-row-reverse sm:flex-row-reverse">
                <Button onClick={handlePasswordUnlock} disabled={isUnlocking}>
                    {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </Button>
                <Dialog open={isBackupCodeDialogOpen} onOpenChange={setIsBackupCodeDialogOpen}>
                    <Button variant="link" onClick={() => setIsBackupCodeDialogOpen(true)}>Use a backup code</Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Use Backup Code</DialogTitle>
                            <DialogDescription>
                                If you've forgotten your password, you can use one of your single-use backup codes to unlock this listspace.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                           <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Using a backup code will reset your current password. You will need to set a new one.
                                </AlertDescription>
                            </Alert>
                            <Label htmlFor="backup-code">Backup Code</Label>
                            <Input
                                id="backup-code"
                                value={backupCodeInput}
                                onChange={(e) => setBackupCodeInput(e.target.value)}
                                placeholder="Enter 8-digit backup code"
                            />
                        </div>
                        <DialogFooter>
                             <Button variant="secondary" onClick={() => setIsBackupCodeDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleBackupCodeUnlock} disabled={isUnlocking}>
                                 {isUnlocking ? 'Unlocking...' : 'Unlock and Reset Password'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </TasksContext.Provider>
  );
}
