
"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeDialog } from "@/app/components/welcome-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, LayoutGrid, Plus } from "lucide-react";
import { useState, memo, useMemo } from "react";
import { SettingsDialog } from "@/app/components/settings-dialog";
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

const NotesPageContent = memo(function NotesPageContentInternal() {
  const tasksHook = useTasks();
  const { toggleSidebar } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    if (newNoteId) {
        // We can optionally focus the new note later
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
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGate>
      <FirestoreWorkspaceSidebar tasksHook={tasksHook} />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <LayoutGrid className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="start">
                    <DropdownMenuItem onClick={() => toggleSidebar()}>
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
                <Button variant="ghost" size="icon" onClick={() => toggleSidebar()}>
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-center text-foreground hidden sm:block">Listily</h1>
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
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hidden md:inline-flex" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <UserNav />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-8 h-full">
              <AnimatePresence>
                <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-full">
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
        </div>
      </SidebarInset>
      <WelcomeDialog open={isFirstTime} onOpenChange={setIsFirstTime} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onResetApp={resetApp} />
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
    </AuthGate>
  );
});

export default function NotesPage() {
  return (
    <SidebarProvider>
      <NotesPageContent />
    </SidebarProvider>
  );
}
