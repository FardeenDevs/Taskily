
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
            class: 'list-decimal pl-6',
          },
        },
      }),
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none w-full h-full text-lg placeholder:text-muted-foreground/40',
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
      // We don't focus the editor here to allow title editing first
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
      <DialogContent className={cn("w-screen h-screen max-w-none rounded-none flex flex-col p-8 sm:p-12")}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-extrabold border-0 shadow-none focus-visible:ring-0 text-center h-auto py-2 mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              editor?.commands.focus();
            }
          }}
        />
        
        <div className="flex-grow pt-4 overflow-y-auto">
           <RichTextEditor editor={editor} />
        </div>
        <RichTextToolbar editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
