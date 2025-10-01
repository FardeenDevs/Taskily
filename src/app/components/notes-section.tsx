
"use client";

import { useState, memo } from 'react';
import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NoteDialog } from './note-dialog';
import { NoteItem } from './note-item';
import { AnimatePresence, motion } from 'framer-motion';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onEditNote: (id: string, newTitle: string, newContent: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesSection = memo(function NotesSection({ notes, onAddNote, onEditNote, onDeleteNote }: NotesSectionProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleOpenNewNoteDialog = () => {
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleOpenEditNoteDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = (id: string | null, title: string, content: string) => {
    if (id) {
      onEditNote(id, title, content);
    } else {
      onAddNote(title, content);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenNewNoteDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">No notes yet!</h3>
            <p className="text-sm text-muted-foreground">Click "New Note" to get started.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <NoteItem
                  note={note}
                  onEdit={() => handleOpenEditNoteDialog(note)}
                  onDelete={() => onDeleteNote(note.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        note={editingNote}
        onSave={handleSaveNote}
      />
    </div>
  );
});
