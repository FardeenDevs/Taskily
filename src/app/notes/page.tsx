
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lock, Unlock, ShieldAlert } from "lucide-react";
import { useState, memo, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { PageTransition } from '../components/page-transition';
import { MainLayout } from "../components/main-layout";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { MouseEvent } from "react";

const WelcomeDialog = dynamic(() => import('@/app/components/welcome-dialog').then(mod => mod.WelcomeDialog));
const SettingsDialog = dynamic(() => import('@/app/components/settings-dialog').then(mod => mod.SettingsDialog));
const NoteDialog = dynamic(() => import('../components/note-dialog').then(mod => mod.NoteDialog));


const NotesPageContent = memo(function NotesPageContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const {
    notes,
    loading,
    addNote,
    editNote,
    deleteNote,
    activeWorkspace,
    isFirstTime,
    setIsFirstTime,
    resetApp,
    deleteAccount,
    unlockedWorkspaces,
    lockWorkspace,
    workspaces,
    appSettings, 
    setAppSettings,
    activeWorkspaceId
  } = tasksHook;


  const isLocked = useMemo(() => {
    if (!activeWorkspace) return false;
    return !!activeWorkspace.password && !unlockedWorkspaces.has(activeWorkspace.id);
  }, [activeWorkspace, unlockedWorkspaces]);


  useEffect(() => {
    // If the user lands here and the workspace is locked, redirect them to the home page
    // where the unlock flow is now handled.
    if (!loading && activeWorkspaceId && isLocked) {
      router.push('/');
    }
  }, [loading, activeWorkspaceId, isLocked, router]);

  const handleOpenEditDialog = useCallback((note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  }, []);
  
  const handleOpenNewNoteDialog = useCallback(() => {
    if (!activeWorkspace || isLocked) return;
    const newNote = addNote();
    if (newNote) {
        setEditingNote(newNote);
        setIsNoteDialogOpen(true);
    }
  }, [activeWorkspace, isLocked, addNote]);
  
 const handleSaveNote = useCallback((id: string, newTitle: string, newContent: string, isNew?: boolean) => {
    if (isNew && !newTitle.trim() && (!newContent.trim() || newContent === '<p></p>')) {
        deleteNote(id, true);
        return;
    }
    editNote(id, newTitle, newContent, isNew);
  }, [editNote, deleteNote]);

  const handleDeleteNote = useCallback((id: string) => {
      deleteNote(id);
  }, [deleteNote]);


 const handleCloseNoteDialog = useCallback((open: boolean) => {
    if (!open && editingNote) {
    }
    setIsNoteDialogOpen(open);
    if (!open) {
        setEditingNote(null);
    }
  }, [editingNote]);


  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    return [...notes].sort((a, b) => {
        const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
        const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [notes]);
  
  const handleLock = () => {
    if (!activeWorkspace) return;
    lockWorkspace(activeWorkspace.id);
  }

  const handleNotesNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Already on the notes page, do nothing.
  };

  if (loading || isNavigating || (!loading && isLocked)) {
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
        <div className="p-4 sm:p-6 md:p-8 h-full">
            <PageTransition>
                <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground">
                        {activeWorkspace?.name || "My Notes"}
                        </CardTitle>
                        {activeWorkspace?.password && (
                            isLocked 
                                ? <Lock className="h-5 w-5"/>
                                : <Button variant="ghost" size="icon" onClick={handleLock}><Unlock className="h-5 w-5"/></Button>
                        )}
                    </div>
                    <Button onClick={handleOpenNewNoteDialog} variant="gradient" disabled={!activeWorkspace || isLocked}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-6 pt-0">
                      {isLocked ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
                              <ShieldAlert className="h-12 w-12 text-muted-foreground/50 mb-4" />
                              <h3 className="text-lg font-semibold text-muted-foreground">Listspace Locked</h3>
                              <p className="text-sm text-muted-foreground">Go to the Progress page to unlock.</p>
                          </div>
                      ) : (
                          <NotesSection
                              notes={sortedNotes}
                              onDeleteNote={handleDeleteNote}
                              onEditNote={handleOpenEditDialog}
                              isLocked={isLocked}
                          />
                      )}
                    </CardContent>
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
       {isNoteDialogOpen && <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={handleCloseNoteDialog}
        note={editingNote}
        onSave={handleSaveNote}
      />}
    </>
  );
});

export default function NotesPage() {
    return (
        <NotesPageContent />
    );
}
