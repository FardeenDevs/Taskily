
"use client";

import React, { use, useEffect, useState } from "react";
import { useTasks as useTasksClient } from "@/lib/hooks/use-tasks";
import { useUser } from "@/firebase";
import { MainLayout as MainLayoutComponent } from "./components/main-layout";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BackupCodesDialog } from "@/components/ui/backup-codes-dialog";

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
    } = tasksHook;

  const [currentView, setCurrentView] = useState<'progress' | 'notes'>('progress');
  
  const pathname = usePathname();

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


  if (loading && !tasksHook.activeWorkspaceId) {
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
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
        >
          {children}
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
    </TasksContext.Provider>
  );
}
