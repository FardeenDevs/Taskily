
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { X } from 'lucide-react';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSave: (id: string, newTitle: string, newContent: string, isNew?: boolean) => void;
}

export function NoteDialog({ open, onOpenChange, note, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const contentRef = useRef<string>('');

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
    },
  });

  useEffect(() => {
    if (open && note && editor) {
      const content = note.content || '';
      contentRef.current = content;
      setTitle(note.title);
      editor.commands.setContent(content);
    }
  }, [note, open, editor]);
  
  const handleSave = () => {
    if (note) {
      onSave(note.id, title, contentRef.current, note.isNew);
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
      <DialogContent 
        className={cn(
          "flex h-full w-full max-w-full flex-col gap-0 p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-lg"
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
            <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)} className="h-9 w-9">
              <X />
              <span className="sr-only">Close</span>
            </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 pb-24">
           <RichTextEditor editor={editor} />
        </div>

        <RichTextToolbar editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
