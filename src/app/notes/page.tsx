
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { Plus, Lock, Unlock } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NotesPageContent = memo(function NotesPageContentInternal() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
    lockWorkspace,
  } = tasksHook;


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


  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenNewNoteDialog = () => {
    if (!activeWorkspace || isLocked) return;
    const newNote = addNote();
    if (newNote) {
        setEditingNote(newNote);
        setIsNoteDialogOpen(true);
    }
  };
  
  const handleSaveNote = useCallback((id: string, title: string, content: string, isNew?: boolean) => {
    editNote(id, title, content, isNew);
  }, [editNote]);


  const handleCloseNoteDialog = (open: boolean) => {
    if (!open) {
      if (editingNote) {
        const { id, title, content, isNew } = editingNote;
        if (isNew && title === 'New Note' && content === '') {
          deleteNote(id, true);
        } else {
          handleSaveNote(id, title, content, isNew);
        }
      }
      setEditingNote(null);
    }
    setIsNoteDialogOpen(open);
  };

  const sortedNotes = useMemo(() => {
    return [...(notes || [])].sort((a, b) => {
        const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
        const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
        if (a.isNew) return -1;
        if (b.isNew) return 1;
        return dateB.getTime() - dateA.getTime();
    });
  }, [notes]);
  
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

  const handleBackFromLocked = () => {
    router.push('/');
    setIsUnlockDialogOpen(false);
  }

  const onUnlockDialogClose = (open: boolean) => {
      if (!open && isLocked) {
        // Prevents closing via overlay click or Esc when locked, but allows cancel button.
        // The cancel button will have already changed the active workspace.
        const stillLocked = !!activeWorkspace?.password && !unlockedWorkspaces.has(activeWorkspace.id);
        if(stillLocked) return;
      }
      setIsUnlockDialogOpen(open);
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
      <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen} setIsNavigating={setIsNavigating}>
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
                        onDeleteNote={(id) => deleteNote(id)}
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
        onOpenChange={setIsNoteDialogOpen}
        note={editingNote}
        onSave={(id, title, content, isNew) => setEditingNote({ ...editingNote!, title, content, isNew })}
      />
       <AlertDialog open={isUnlockDialogOpen} onOpenChange={onUnlockDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This Listspace is Locked</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password to view your notes.
            </AlertDialogDescription>
            {activeWorkspace?.passwordHint && failedPasswordAttempts >= 3 && (
                <div className="text-sm text-muted-foreground pt-2 text-left">
                    <span className="font-semibold text-foreground">Hint:</span> {activeWorkspace.passwordHint}
                </div>
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
            <AlertDialogCancel onClick={handleBackFromLocked}>Back</AlertDialogCancel>
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
