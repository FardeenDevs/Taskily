
"use client";

import React, { use, useEffect, useState } from "react";
import { useTasks as useTasksClient } from "@/lib/hooks/use-tasks";
import { useUser } from "@/firebase";
import { MainLayout as MainLayoutComponent } from "./components/main-layout";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { BackupCodesDialog } from "@/components/ui/backup-codes-dialog";
import { NotesBackupCodesDialog } from "@/components/ui/notes-backup-codes-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthGate } from "./components/auth-gate";
import { TimerAlertDialog } from "@/app/components/timer-alert-dialog";
import type { Task } from "@/lib/types";

type useTasksType = ReturnType<typeof useTasksClient>;
const TasksContext = React.createContext<useTasksType | null>(null);

type View = 'progress' | 'notes';
type ViewContextType = {
  currentView: View;
  setCurrentView: (view: View) => void;
}
const ViewContext = React.createContext<ViewContextType | null>(null);


export const useTasks = () => {
    const context = use(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a AppLayout");
    }
    return context;
}

export const useView = () => {
    const context = use(ViewContext);
    if (!context) {
        throw new Error("useView must be used within a AppLayout");
    }
    return context;
}

const WelcomeDialog = dynamic(() => import('@/app/components/welcome-dialog').then(mod => mod.WelcomeDialog));
const SettingsDialog = dynamic(() => import('@/app/components/settings-dialog').then(mod => mod.SettingsDialog), {
    loading: () => <LoadingSpinner />,
});


export function AppLayout({ children }: { children: React.ReactNode }) {
  const tasksHook = useTasksClient();
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
      isFirstTime, 
      setIsFirstTime, 
      resetApp, 
      deleteAccount, 
      workspaces, 
      appSettings, 
      setAppSettings,
      backupCodes,
      clearBackupCodes,
      notesBackupCodes,
      clearNotesBackupCodes,
      loading,
      isResetting,
      isDeleting,
      activeTimers,
      handleTimerTick,
      finishedTimerTask,
      clearFinishedTimer,
    } = tasksHook;

  const [currentView, setCurrentView] = useState<'progress' | 'notes'>('progress');
  
  const showLoadingSpinner = (loading || isResetting || isDeleting) && pathname !== '/login';

  useEffect(() => {
    const intervals = activeTimers.map(timer => {
        if (timer.isActive) {
            return setInterval(() => {
                const newRemaining = timer.remaining - 1;
                if (newRemaining >= 0) {
                    handleTimerTick(timer.taskId, newRemaining);
                }
            }, 1000);
        }
        return null;
    }).filter(Boolean);

    return () => {
        intervals.forEach(interval => clearInterval(interval!));
    };
}, [activeTimers, handleTimerTick]);

  return (
    <TasksContext.Provider value={tasksHook}>
      <ViewContext.Provider value={{ currentView, setCurrentView }}>
        <AuthGate>
          {showLoadingSpinner && <LoadingSpinner />}
          
          <MainLayoutComponent 
              tasksHook={tasksHook} 
              setIsSettingsOpen={setIsSettingsOpen}
          >
            {children}
          </MainLayoutComponent>

          {isFirstTime && <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />}
          
          {backupCodes && <BackupCodesDialog open={!!backupCodes} onOpenChange={clearBackupCodes} codes={backupCodes} />}

          {notesBackupCodes && <NotesBackupCodesDialog open={!!notesBackupCodes} onOpenChange={clearNotesBackupCodes} codes={notesBackupCodes} />}
          
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
          
          {finishedTimerTask && (
            <TimerAlertDialog
                task={finishedTimerTask}
                onClose={clearFinishedTimer}
            />
          )}

        </AuthGate>
      </ViewContext.Provider>
    </TasksContext.Provider>
  );
}
