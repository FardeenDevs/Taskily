
"use client";

import { useState, useEffect } from 'react';
import { type Note } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSave: (id: string | null, title: string, content: string) => void;
}

export function NoteDialog({ open, onOpenChange, note, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, open]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(note?.id ?? null, title, content);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleSave();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("w-screen h-screen max-w-none rounded-none flex flex-col")}>
        <DialogHeader>
          <DialogTitle>
             <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your note title..."
                className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 px-0"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('note-content')?.focus();
                    }
                }}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow">
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Just start writing..."
              className="w-full h-full resize-none border-0 shadow-none focus-visible:ring-0 text-base"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
