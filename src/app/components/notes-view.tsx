
"use client";

import { useMemo, useCallback } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Lock } from "lucide-react";
import { NotesSection } from "@/app/components/notes-section";
import { type useTasks } from "@/lib/hooks/use-tasks";

type NotesViewProps = ReturnType<typeof useTasks>;

export function NotesView(props: NotesViewProps) {
    const {
        notes,
        deleteNote,
        activeWorkspace,
        isNotesLocked,
        handleOpenEditDialog,
        handleOpenNewNoteDialog,
    } = props;

    const sortedNotes = useMemo(() => {
        if (!notes) return [];
        return [...notes].sort((a, b) => {
            const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
            const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [notes]);

    const isNotesViewLocked = !activeWorkspace || (!!activeWorkspace.notesPassword && isNotesLocked);

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground">
                    {activeWorkspace?.name || "My Notes"}
                    </CardTitle>
                    {activeWorkspace?.notesPassword && <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <Button onClick={handleOpenNewNoteDialog} variant="gradient" disabled={isNotesViewLocked}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-6 pt-0">
                <NotesSection
                    notes={sortedNotes}
                    onDeleteNote={deleteNote}
                    onEditNote={handleOpenEditDialog}
                    isLocked={isNotesViewLocked}
                />
            </CardContent>
        </>
    );
}
