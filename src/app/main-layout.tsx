
"use client";

import React, { use, useEffect, useState } from "react";
import { useTasks as useTasksClient } from "@/lib/hooks/use-tasks";
import { useUser } from "@/firebase";
import { MainLayout as MainLayoutComponent } from "./components/main-layout";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BackupCodesDialog } from "@/components/ui/backup-codes-dialog";
import { NotesBackupCodesDialog } from "@/components/ui/notes-backup-codes-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthGate } from "./components/auth-gate";

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
      clearNotesBackupCodes
    } = tasksHook;

  const [currentView, setCurrentView] = useState<'progress' | 'notes'>('progress');

  useEffect(() => {
    // When the route changes, update the view state
    if (pathname === '/notes') {
      setCurrentView('notes');
    } else { // This will cover '/' and '/profile'
      setCurrentView('progress');
    }
  }, [pathname]);

  const handleSetCurrentView = (view: 'progress' | 'notes') => {
    const newPath = view === 'notes' ? '/notes' : '/';
    if (pathname !== newPath) {
        router.push(newPath);
    }
  }

  // If we are on the login page, just render the children (the login page itself)
  // without the main app layout.
  if (pathname === '/login') {
    return (
      <TasksContext.Provider value={tasksHook}>
        <AuthGate>
          {children}
        </AuthGate>
      </TasksContext.Provider>
    );
  }

  return (
    <TasksContext.Provider value={tasksHook}>
      <AuthGate>
        <MainLayoutComponent 
            tasksHook={tasksHook} 
            setIsSettingsOpen={setIsSettingsOpen} 
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
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
       </AuthGate>
    </TasksContext.Provider>
  );
}
