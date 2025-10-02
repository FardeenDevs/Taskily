
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lock, Unlock } from "lucide-react";
import { useState, memo, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { PageTransition } from '../components/page-transition';
import { MainLayout } from "../components/main-layout";
import { useUser } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const router = useRouter();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isBackupCodeDialogOpen, setIsBackupCodeDialogOpen] = useState(false);
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
    unlockWithPassword,
    unlockWithBackupCode,
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
    // If the note is new and has no title/content, delete it locally.
    if (isNew && !newTitle.trim() && (!newContent.trim() || newContent === '<p></p>')) {
        deleteNote(id, true); // true for local-only deletion
        return;
    }
    editNote(id, newTitle, newContent, isNew);
  }, [editNote, deleteNote]);

  const handleDeleteNote = useCallback((id: string) => {
      deleteNote(id);
  }, [deleteNote]);


 const handleCloseNoteDialog = useCallback((open: boolean) => {
    if (!open && editingNote) {
      // The `handleSaveNote` is now also called from inside the dialog on close
      // To ensure we capture the latest editor state.
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
  
  const handlePasswordUnlock = async () => {
    if (!activeWorkspace) return;
    if (await unlockWithPassword(activeWorkspace.id, passwordInput)) {
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

  const handleBackupCodeUnlock = async () => {
    if (!activeWorkspace) return;
     if (await unlockWithBackupCode(activeWorkspace.id, passwordInput)) {
        setIsBackupCodeDialogOpen(false);
        setPasswordInput("");
        toast({ title: "Listspace Unlocked" });
    } else {
        toast({ variant: "destructive", title: "Incorrect or Used Backup Code" });
        setPasswordInput("");
    }
  }

  const handleLock = () => {
    if (!activeWorkspace) return;
    lockWorkspace(activeWorkspace.id);
    toast({ title: "Listspace Locked" });
  }

  const handleBackFromLocked = () => {
    router.push('/');
    setIsUnlockDialogOpen(false);
    setIsBackupCodeDialogOpen(false);
  }

  const onUnlockDialogClose = (open: boolean) => {
      if (!open && isLocked) {
        handleBackFromLocked();
      } else {
        setIsUnlockDialogOpen(open);
      }
  }

  const openBackupDialog = () => {
    setIsUnlockDialogOpen(false);
    setPasswordInput("");
    setFailedPasswordAttempts(0);
    setIsBackupCodeDialogOpen(true);
  }

  const backToPasswordDialog = () => {
    setIsBackupCodeDialogOpen(false);
    setPasswordInput("");
    setIsUnlockDialogOpen(true);
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
                        onDeleteNote={handleDeleteNote}
                        onEditNote={handleOpenEditDialog}
                        isLocked={isLocked}
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
      />}
       {isNoteDialogOpen && <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={handleCloseNoteDialog}
        note={editingNote}
        onSave={handleSaveNote}
      />}
       <AlertDialog open={isUnlockDialogOpen} onOpenChange={onUnlockDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This Listspace is Locked</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password to view your notes.
              {activeWorkspace?.passwordHint && failedPasswordAttempts >= 3 && (
                <div className="text-xs text-muted-foreground mt-2">Hint: {activeWorkspace.passwordHint}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-3">
            <Label htmlFor="password-unlock" className="sr-only">Password</Label>
            <Input 
                id="password-unlock" 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordUnlock()}
                placeholder="Enter password..." 
            />
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={openBackupDialog}>
                Forgot Password?
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBackFromLocked}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordUnlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBackupCodeDialogOpen} onOpenChange={setIsBackupCodeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Backup Code</AlertDialogTitle>
            <AlertDialogDescription>
              Enter one of your 6-character backup codes to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="backup-code-unlock" className="sr-only">Backup Code</Label>
            <Input 
                id="backup-code-unlock" 
                type="text" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBackupCodeUnlock()}
                placeholder="Enter backup code..." 
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={backToPasswordDialog}>Back to Password</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackupCodeUnlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default function NotesPage() {
    return (
        <NotesPageContent />
    );
}
