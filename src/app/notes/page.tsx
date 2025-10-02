
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState, memo, useMemo, useCallback, useEffect, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { PageTransition } from '../components/page-transition';
import { MainLayout } from "../components/main-layout";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

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
    workspaces,
    appSettings, 
    setAppSettings,
  } = tasksHook;

  useEffect(() => {
    if (!loading && !isNavigating) {
      // Any page-specific logic can go here
    }
  }, [loading, isNavigating, router]);

  const handleOpenEditDialog = useCallback((note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  }, []);
  
  const handleOpenNewNoteDialog = useCallback(() => {
    if (!activeWorkspace) return;
    const newNote = addNote();
    if (newNote) {
        setEditingNote(newNote);
        setIsNoteDialogOpen(true);
    }
  }, [activeWorkspace, addNote]);
  
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
  
  const handleNotesNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Already on the notes page, do nothing.
  };

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
        <div className="p-4 sm:p-6 md:p-8 h-full">
            <PageTransition>
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
                          isLocked={false}
                      />
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
