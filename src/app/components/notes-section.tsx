
"use client";

import { useState, memo, useEffect } from 'react';
import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NoteDialog } from './note-dialog';
import { NoteItem } from './note-item';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => string | undefined;
  onEditNote: (id: string, newTitle: string, newContent: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesSection = memo(function NotesSection({ notes, onAddNote, onEditNote, onDeleteNote }: NotesSectionProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleOpenNewNoteDialog = () => {
    const newNoteId = onAddNote("New Note", "");
    if (newNoteId) {
      const newNote = { id: newNoteId, title: "New Note", content: "", createdAt: new Date().toISOString(), workspaceId: '' };
      handleOpenEditTitleDialog(newNote);
    }
  };

  const handleOpenEditContentDialog = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };
  
  const handleOpenEditTitleDialog = (note: Note) => {
    setEditingNote(note);
    setEditingTitle(note.title);
    setIsTitleDialogOpen(true);
  };

  const handleSaveContent = (content: string) => {
    if (editingNote) {
      onEditNote(editingNote.id, editingNote.title, content);
    }
  };

  const handleSaveTitle = () => {
    if (editingNote && editingTitle.trim() !== '') {
      onEditNote(editingNote.id, editingTitle, editingNote.content);
    }
    setIsTitleDialogOpen(false);
    setEditingNote(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenNewNoteDialog} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
            <h3 className="text-lg font-semibold text-muted-foreground">No notes yet!</h3>
            <p className="text-sm text-muted-foreground">Click "New Note" to get started.</p>
          </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
                {notes.map(note => (
                <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="h-full"
                >
                    <NoteItem
                      note={note}
                      onEditContent={() => handleOpenEditContentDialog(note)}
                      onEditTitle={() => handleOpenEditTitleDialog(note)}
                      onDelete={() => onDeleteNote(note.id)}
                    />
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        note={editingNote}
        onSaveContent={handleSaveContent}
      />
      
      <Dialog open={isTitleDialogOpen} onOpenChange={setIsTitleDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Note Title</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="note-title-input" className="sr-only">Title</Label>
                <Input 
                    id="note-title-input"
                    value={editingTitle} 
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()} 
                    placeholder="Enter note title"
                />
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsTitleDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveTitle}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
