
"use client";

import { useTasks } from "@/app/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NotesSection } from "@/app/components/notes-section";
import { Note } from "@/lib/types";
import dynamic from "next/dynamic";


const NoteDialog = dynamic(() => import('@/app/components/note-dialog').then(mod => mod.NoteDialog));


export default function NotesPage() {
  const {
    notes,
    addNote,
    editNote,
    deleteNote,
    activeWorkspace,
  } = useTasks();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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

  return (
    <>
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
       {isNoteDialogOpen && <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={handleCloseNoteDialog}
        note={editingNote}
        onSave={handleSaveNote}
      />}
    </>
  );
}
