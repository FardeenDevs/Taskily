
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, LayoutGrid, Plus, ShieldCheck, ShieldAlert } from "lucide-react";
import { useState, memo, useMemo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Button } from "@/components/ui/button";
import { WorkspaceSidebar } from "@/app/components/workspace-sidebar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { NoteDialog } from "../components/note-dialog";
import { PasswordDialog } from "../components/password-dialog";


interface NotesPageContentProps {
  tasksHook: ReturnType<typeof useTasks>;
}

const NotesPageContent = memo(function NotesPageContent({ tasksHook }: NotesPageContentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setOpen: setSidebarOpen } = useSidebar();
  const pathname = usePathname();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const {
    notes,
    loading,
    addNote,
    editNote,
    deleteNote,
    activeWorkspace,
    previousWorkspaceId,
    isFirstTime,
    setIsFirstTime,
    resetApp,
    isWorkspaceLocked,
    unlockWorkspace,
    switchWorkspace,
  } = tasksHook;

  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenNewNoteDialog = () => {
    const newNoteId = addNote("New Note", "");
    if (newNoteId) {
      const newNote = { id: newNoteId, title: "New Note", content: "", createdAt: new Date().toISOString(), workspaceId: activeWorkspace?.id || '' };
      handleOpenEditDialog(newNote);
    }
  };
  
  const handleUnlock = (password: string) => {
    if (activeWorkspace) {
      unlockWorkspace(activeWorkspace.id, password);
    }
  };
  
  const handleGoBack = () => {
    if (previousWorkspaceId) {
      switchWorkspace(previousWorkspaceId);
    }
  };

  const handleSave = (id: string, title: string, content: string) => {
    editNote(id, title, content);
  };
  
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes]);


  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl space-y-8">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <SidebarInset>
      <header className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                 <div className="z-50 md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem onClick={() => setSidebarOpen(true)}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            <span>Listspaces</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            
                <div className="hidden md:block">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            
             <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-center text-foreground">Listily</h1>
                <nav className="flex items-center gap-2 rounded-full bg-secondary p-1">
                    <Link href="/" passHref>
                        <span className={cn(
                            "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                            pathname === '/' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                        )}>
                            Progress
                        </span>
                    </Link>
                    <Link href="/notes" passHref>
                        <span className={cn(
                            "cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors",
                            pathname === '/notes' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                        )}>
                            Notes
                        </span>
                    </Link>
                </nav>
            </div>

            <div>
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>

      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 pt-0 sm:p-8 sm:pt-0">
        <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} />
        {isWorkspaceLocked && activeWorkspace && (
          <PasswordDialog 
            open={isWorkspaceLocked}
            onUnlock={handleUnlock}
            onBack={handleGoBack}
            workspaceName={activeWorkspace.name}
            hint={activeWorkspace.passwordHint}
          />
        )}
        <div className="w-full max-w-4xl">
          <AnimatePresence>
            <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeWorkspace?.password ? (
                        isWorkspaceLocked ? <ShieldAlert className="h-6 w-6 text-destructive" /> : <ShieldCheck className="h-6 w-6 text-primary" />
                    ) : null}
                    <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground">
                        {activeWorkspace?.name || "My Notes"}
                    </CardTitle>
                  </div>
                  <Button onClick={handleOpenNewNoteDialog} variant="gradient" disabled={isWorkspaceLocked}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <NotesSection
                    notes={sortedNotes}
                    onDeleteNote={deleteNote}
                    onEditNote={handleOpenEditDialog}
                    isLocked={isWorkspaceLocked}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        note={editingNote}
        onSave={handleSave}
      />
    </SidebarInset>
  );
});

export default function NotesPage() {
  const tasksHook = useTasks();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <WorkspaceSidebar tasksHook={tasksHook} />
        <NotesPageContent tasksHook={tasksHook} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
