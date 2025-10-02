
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
const NoteDialog = dynamic(() => import('./components/note-dialog').then(mod => mod.NoteDialog));
const TaskList = dynamic(() => import('./components/task-list').then(mod => mod.TaskList));
const TaskInput = dynamic(() => import('./components/task-input').then(mod => mod.TaskInput));
const TaskProgress = dynamic(() => import('./components/task-progress').then(mod => mod.TaskProgress));
const TaskSuggestions = dynamic(() => import('./components/task-suggestions').then(mod => mod.TaskSuggestions));
const NotesSection = dynamic(() => import('./components/notes-section').then(mod => mod.NotesSection));

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Note, Priority, Effort } from "@/lib/types";
import { useCallback, useMemo } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const tasksHook = useTasksClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      editTask,
      completedTasks,
      totalTasks,
      activeWorkspace,
      activeWorkspaceId,
      clearTasks: clearTasksFromHook,
      notes,
      addNote: addNoteFromHook,
      editNote: editNoteFromHook,
      deleteNote: deleteNoteFromHook
    } = tasksHook;

  const [currentView, setCurrentView] = useState<'progress' | 'notes'>('progress');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we are on the profile page, don't force a view
    if (pathname === '/profile') return;
    
    // When the route changes, update the view
    if (pathname === '/notes') {
      setCurrentView('notes');
    } else {
      setCurrentView('progress');
    }
  }, [pathname]);

  const handleSetCurrentView = (view: 'progress' | 'notes') => {
    if (view === currentView) return;
    const newPath = view === 'notes' ? '/notes' : '/';
    router.push(newPath);
    setCurrentView(view);
  }

  // Task related handlers
  const handleClearTasks = useCallback(() => {
    if (activeWorkspaceId) {
      clearTasksFromHook(activeWorkspaceId);
    }
  }, [activeWorkspaceId, clearTasksFromHook]);

  const handleAddTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    addTask(text, priority, effort);
  }, [addTask]);

  // Note related handlers
  const handleOpenEditDialog = useCallback((note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  }, []);
  
  const handleOpenNewNoteDialog = useCallback(() => {
    if (!activeWorkspace) return;
    const newNote = addNoteFromHook();
    if (newNote) {
        setEditingNote(newNote);
        setIsNoteDialogOpen(true);
    }
  }, [activeWorkspace, addNoteFromHook]);

  const handleSaveNote = useCallback((id: string, newTitle: string, newContent: string, isNew?: boolean) => {
    if (isNew && !newTitle.trim() && (!newContent.trim() || newContent === '<p></p>')) {
        deleteNoteFromHook(id, true);
        return;
    }
    editNoteFromHook(id, newTitle, newContent, isNew);
  }, [editNoteFromHook, deleteNoteFromHook]);

  const handleDeleteNote = useCallback((id: string) => {
      deleteNoteFromHook(id);
  }, [deleteNoteFromHook]);

  const handleCloseNoteDialog = useCallback((open: boolean) => {
    setIsNoteDialogOpen(open);
    if (!open) {
        setEditingNote(null);
    }
  }, []);

  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    return [...notes].sort((a, b) => {
        const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
        const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [notes]);


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
  
  const renderContent = () => {
    // We only render children if the path is not the main one, e.g. /profile
    if (pathname !== '/' && pathname !== '/notes') {
      return children;
    }

    if (currentView === 'notes') {
      return (
        <div className="p-4 sm:p-6 md:p-8 h-full">
            <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground">
                    {activeWorkspace?.name || "My Notes"}
                    </CardTitle>
                </div>
                <Button onClick={handleOpenNewNoteDialog} variant="gradient" disabled={!activeWorkspace}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-6 pt-0">
                    <NotesSection
                        notes={sortedNotes}
                        onDeleteNote={handleDeleteNote}
                        onEditNote={handleOpenEditDialog}
                        isLocked={!activeWorkspace}
                    />
                </CardContent>
            </Card>
        </div>
      );
    }

    return (
       <div className="mx-auto max-w-5xl w-full h-full p-4 sm:p-8">
        <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground text-center">
                {activeWorkspace?.name || "My List"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 flex-grow overflow-y-auto p-6 pt-0">
            {!activeWorkspace ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
                  <h3 className="text-lg font-semibold text-muted-foreground">Select a Listspace</h3>
                  <p className="text-sm text-muted-foreground">Choose a listspace from the sidebar to get started.</p>
              </div>
            ) : (
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
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={tasks.length === 0 || !activeWorkspace}
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
      </div>
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
          {renderContent()}
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

        {isNoteDialogOpen && <NoteDialog
          open={isNoteDialogOpen}
          onOpenChange={handleCloseNoteDialog}
          note={editingNote}
          onSave={handleSaveNote}
        />}
    </TasksContext.Provider>
  );
}
