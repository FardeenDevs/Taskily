
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { Plus, ShieldAlert, Lock, Unlock, ShieldQuestion } from "lucide-react";
import { useState, memo, useMemo, useEffect, useCallback } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { NoteDialog } from "../components/note-dialog";
import { PageTransition } from '../components/page-transition';
import { MainLayout } from "../components/main-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const NotesPageContent = memo(function NotesPageContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [failedPasswordAttempts, setFailedPasswordAttempts] = useState(0);

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
    unlockWorkspace,
    lockWorkspace
  } = tasksHook;

  const [clientNotes, setClientNotes] = useState<Note[]>([]);

  const isLocked = useMemo(() => {
    if (!activeWorkspace) return false;
    return !!activeWorkspace.password && !unlockedWorkspaces.has(activeWorkspace.id);
  }, [activeWorkspace, unlockedWorkspaces]);

  useEffect(() => {
    if (isLocked) {
      setIsUnlockDialogOpen(true);
    } else {
      setIsUnlockDialogOpen(false);
      setFailedPasswordAttempts(0); // Reset attempts when unlocked
    }
  }, [isLocked]);

  useEffect(() => {
    // Reset attempts when switching workspaces
    setFailedPasswordAttempts(0);
  }, [activeWorkspace?.id])

  useEffect(() => {
    setClientNotes(notes);
  }, [notes]);

  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenNewNoteDialog = () => {
    if (!activeWorkspace || isLocked) return;
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
  
  const handleUnlock = () => {
    if (!activeWorkspace) return;
    if (unlockWorkspace(activeWorkspace.id, passwordInput)) {
        setIsUnlockDialogOpen(false);
        setPasswordInput("");
        setFailedPasswordAttempts(0);
        toast({ title: "Listspace Unlocked" });
    } else {
        toast({ variant: "destructive", title: "Incorrect Password" });
        setPasswordInput("");
        setFailedPasswordAttempts(prev => prev + 1);
    }
  };

  const handleLock = () => {
    if (!activeWorkspace) return;
    lockWorkspace(activeWorkspace.id);
    toast({ title: "Listspace Locked" });
  }

  const onUnlockDialogClose = (open: boolean) => {
      // Prevent closing the dialog with Esc or overlay click if locked and it wasn't triggered by a button.
      // This is a bit of a hack, but it prevents the user from getting stuck if they click outside.
      // A better solution would be to control this from within the Dialog/AlertDialog itself.
      if (!open && isLocked) {
        // Find if the active element is a cancel button
        if (document.activeElement?.ariaLabel?.includes('Cancel')) {
             tasksHook.switchWorkspace(null); // Switch to no workspace
        } else {
            return;
        }
      }
      setIsUnlockDialogOpen(open);
  }


  if (loading && !activeWorkspace) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen}>
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
                                ? <Button variant="ghost" size="icon" onClick={() => setIsUnlockDialogOpen(true)}><Lock className="h-5 w-5"/></Button>
                                : <Button variant="ghost" size="icon" onClick={handleLock}><Unlock className="h-5 w-5"/></Button>
                        )}
                    </div>
                    <Button onClick={handleOpenNewNoteDialog} variant="gradient" disabled={!activeWorkspace || isLocked}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-6 pt-0">
                    <NotesSection
                        notes={sortedNotes}
                        onDeleteNote={deleteNote}
                        onEditNote={handleOpenEditDialog}
                        isLocked={isLocked}
                    />
                    </CardContent>
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
       <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={handleCloseNoteDialog}
        note={editingNote}
        onSave={handleSaveNote}
      />
       <AlertDialog open={isUnlockDialogOpen} onOpenChange={onUnlockDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This Listspace is Locked</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password to view your notes.
            </AlertDialogDescription>
            {activeWorkspace?.passwordHint && failedPasswordAttempts >= 3 && (
                <p className="text-sm text-muted-foreground pt-2">
                    <span className="text-xs font-semibold">Hint:</span> {activeWorkspace.passwordHint}
                </p>
              )}
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="password-unlock" className="sr-only">Password</Label>
            <Input 
                id="password-unlock" 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter password..." 
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default function NotesPage() {
    return (
        <SidebarProvider>
            <NotesPageContent />
        </SidebarProvider>
    );
}

    
