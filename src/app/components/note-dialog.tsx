"use client";

import { useState, useEffect } from 'react';
import { type Note } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'New Note'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your note title..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your note content..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{note ? 'Save Changes' : 'Create Note'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
