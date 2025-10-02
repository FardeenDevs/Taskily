
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
import { FirestoreWorkspaceSidebar } from "@/app/components/firestore-workspace-sidebar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import { NoteDialog } from "../components/note-dialog";
import { AuthGate } from "../components/auth-gate";
import { UserNav } from "../components/user-nav";

const NotesPageContent = memo(function NotesPageContent() {
  const tasksHook = useTasks();
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
    isFirstTime,
    setIsFirstTime,
    resetApp,
  } = tasksHook;

  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenNewNoteDialog = () => {
    if (!activeWorkspace) return;
    const newNoteId = addNote("New Note", "");
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
       <FirestoreWorkspaceSidebar tasksHook={tasksHook} />
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

            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                </Button>
                <UserNav />
            </div>
        </header>

      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 pt-0 sm:p-8 sm:pt-0">
        <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} />
        
        <div className="w-full max-w-4xl">
          <AnimatePresence>
            <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
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
                <CardContent>
                  <NotesSection
                    notes={sortedNotes}
                    onDeleteNote={deleteNote}
                    onEditNote={handleOpenEditDialog}
                    isLocked={false}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={(open) => {
          if (!open && editingNote && editingNote.title === "New Note" && editingNote.content === "") {
            deleteNote(editingNote.id);
          }
          setIsNoteDialogOpen(open);
          setEditingNote(null);
        }}
        note={editingNote}
        onSave={handleSave}
      />
    </SidebarInset>
  );
});

export default function NotesPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthGate>
            <SidebarProvider>
                <NotesPageContent />
            </SidebarProvider>
        </AuthGate>
    </ThemeProvider>
  );
}
