
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { Plus } from "lucide-react";
import { useState, memo, useMemo, useEffect } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { NoteDialog } from "../components/note-dialog";
import { PageTransition } from '../components/page-transition';
import { MainLayout } from "../components/main-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";

const NotesPageContent = memo(function NotesPageContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    deleteAccount
  } = tasksHook;

  const [clientNotes, setClientNotes] = useState<Note[]>([]);

  useEffect(() => {
    setClientNotes(notes);
  }, [notes]);

  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenNewNoteDialog = () => {
    if (!activeWorkspace) return;
    const newNote = addNote();
    if (newNote) {
        setEditingNote(newNote);
        setClientNotes(prev => [newNote, ...prev]);
        setIsNoteDialogOpen(true);
    }
  };
  
  const handleSaveNote = (id: string, title: string, content: string, isNew?: boolean) => {
    // If it's a new note that is still empty, delete it instead of saving
    if (isNew && title.trim() === 'New Note' && content.trim() === '') {
        deleteNote(id);
        setClientNotes(prev => prev.filter(n => n.id !== id));
    } else {
        editNote(id, title, content, isNew);
        // After saving, find the note in clientNotes and remove the 'isNew' flag
        setClientNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, isNew: false } : n));
    }
  };

  const handleCloseNoteDialog = (open: boolean) => {
      if (!open) {
          const noteToClean = editingNote;
          setEditingNote(null);
           // If a new note was closed without being properly saved (i.e. it's still marked as new and is empty)
          if (noteToClean && noteToClean.isNew && noteToClean.title.trim() === 'New Note' && noteToClean.content.trim() === '') {
             deleteNote(noteToClean.id);
             setClientNotes(prev => prev.filter(n => n.id !== noteToClean.id));
          }
      }
      setIsNoteDialogOpen(open);
  };

  const sortedNotes = useMemo(() => {
    return [...clientNotes].sort((a, b) => {
        const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
        const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
        if (a.isNew) return -1;
        if (b.isNew) return 1;
        return dateB.getTime() - dateA.getTime();
    });
  }, [clientNotes]);


  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen} />
      <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        onResetApp={resetApp} 
        onDeleteAccount={deleteAccount} 
        userEmail={user?.email}
      />
       <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={handleCloseNoteDialog}
        note={editingNote}
        onSave={handleSaveNote}
      />
    </>
  );
});

const NotesPageMain = memo(function NotesPageMain() {
    const tasksHook = useTasks();
    const { activeWorkspace, notes, loading } = tasksHook;
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [clientNotes, setClientNotes] = useState<Note[]>([]);

    useEffect(() => {
        setClientNotes(notes);
    }, [notes]);

    const handleOpenEditDialog = (note: Note) => {
        setEditingNote(note);
        setIsNoteDialogOpen(true);
    };

    const handleOpenNewNoteDialog = () => {
        if (!activeWorkspace) return;
        const newNote = tasksHook.addNote();
        if (newNote) {
            setEditingNote(newNote);
            setClientNotes(prev => [newNote, ...prev]);
            setIsNoteDialogOpen(true);
        }
    };

    const handleSaveNote = (id: string, title: string, content: string, isNew?: boolean) => {
        if (isNew && title.trim() === 'New Note' && content.trim() === '') {
            tasksHook.deleteNote(id);
            setClientNotes(prev => prev.filter(n => n.id !== id));
        } else {
            tasksHook.editNote(id, title, content, isNew);
            setClientNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, isNew: false } : n));
        }
    };

    const handleCloseNoteDialog = (open: boolean) => {
        if (!open) {
            const noteToClean = editingNote;
            setEditingNote(null);
            if (noteToClean && noteToClean.isNew && noteToClean.title.trim() === 'New Note' && noteToClean.content.trim() === '') {
                tasksHook.deleteNote(noteToClean.id);
                setClientNotes(prev => prev.filter(n => n.id !== noteToClean.id));
            }
        }
        setIsNoteDialogOpen(open);
    };

    const sortedNotes = useMemo(() => {
        return [...clientNotes].sort((a, b) => {
            const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
            const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
            if (a.isNew) return -1;
            if (b.isNew) return 1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [clientNotes]);

    return (
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
                        onDeleteNote={tasksHook.deleteNote}
                        onEditNote={handleOpenEditDialog}
                        isLocked={false}
                    />
                    </CardContent>
                </Card>
            </PageTransition>
            <NoteDialog
                open={isNoteDialogOpen}
                onOpenChange={handleCloseNoteDialog}
                note={editingNote}
                onSave={handleSaveNote}
            />
        </div>
    )
})

export default function NotesPage() {
    return (
        <SidebarProvider>
            <NotesPageContent />
        </SidebarProvider>
    );
}

