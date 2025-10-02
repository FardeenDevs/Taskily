
"use client";

import { memo } from 'react';
import { type Note } from '@/lib/types';
import { NoteItem } from './note-item';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface NotesSectionProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  isLocked: boolean;
}

export const NotesSection = memo(function NotesSection({ notes, onEditNote, onDeleteNote, isLocked }: NotesSectionProps) {
  if (isLocked) {
     return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
            <h3 className="text-lg font-semibold text-muted-foreground">Select a Listspace</h3>
            <p className="text-sm text-muted-foreground">Choose a listspace from the sidebar to see your notes.</p>
        </div>
     )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
            <h3 className="text-lg font-semibold text-muted-foreground">No notes yet!</h3>
            <p className="text-sm text-muted-foreground">Click "New Note" to get started.</p>
          </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      onEdit={() => onEditNote(note)}
                      onDelete={() => onDeleteNote(note.id)}
                    />
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
});
