
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { type Note } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { RichTextEditor } from './rich-text-editor';
import { RichTextToolbar } from './rich-text-toolbar';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSave: (id: string, newTitle: string, newContent: string, isNew?: boolean) => Promise<void>;
}

export function NoteDialog({ open, onOpenChange, note, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const contentRef = useRef<string>('');
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const noteRef = useRef(note);
  const [isSaving, setIsSaving] = useState(false);

  const handleAutoSave = useCallback(async (isFinalSave = false) => {
    if (noteRef.current) {
       // Don't save if it's a brand new, completely empty note unless it's the final save on close
      if (noteRef.current.isNew && !title.trim() && (!contentRef.current.trim() || contentRef.current === '<p></p>') && !isFinalSave) {
        return;
      }
      setIsSaving(true);
      await onSave(noteRef.current.id, title, contentRef.current, noteRef.current.isNew);
      setIsSaving(false);

      if (noteRef.current.isNew) {
        noteRef.current = { ...noteRef.current, isNew: false };
      }
    }
  }, [onSave, title]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
            HTMLAttributes: {
                class: 'list-decimal',
            },
        },
      }),
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none w-full h-full text-base placeholder:text-muted-foreground/40',
      },
    },
    onUpdate: ({ editor }) => {
      contentRef.current = editor.getHTML();
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      autosaveTimer.current = setTimeout(() => handleAutoSave(false), 300);
    },
  });

  useEffect(() => {
    noteRef.current = note;
    if (open && note && editor) {
      const content = note.content || '';
      contentRef.current = content;
      setTitle(note.title);
      editor.commands.setContent(content, false);
    }
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [note, open, editor]);

  useEffect(() => {
    if (!open) return; 
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = setTimeout(() => handleAutoSave(false), 300);
    
    return () => {
        if (autosaveTimer.current) {
          clearTimeout(autosaveTimer.current);
        }
    }
  }, [title, handleAutoSave, open]);


  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Perform a final save when the dialog is being closed
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      handleAutoSave(true);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          "flex h-full w-full max-w-full flex-col gap-0 p-0 rounded-none border-none"
        )}
        showCloseButton={false}
      >
        <div className="flex items-center justify-between border-b p-4">
            <DialogTitle className="sr-only">{title || 'Edit Note'}</DialogTitle>
             <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="border-0 text-lg font-semibold shadow-none focus-visible:ring-0 h-auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  editor?.commands.focus();
                }
              }}
            />
            <div className="flex items-center gap-4">
                 <AnimatePresence>
                    {isSaving && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </motion.div>
                    )}
                 </AnimatePresence>
                <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)} className="h-9 w-9">
                  <X />
                  <span className="sr-only">Close</span>
                </Button>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 pb-24">
           <RichTextEditor editor={editor} />
        </div>

        <RichTextToolbar editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
