
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

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSaveContent: (content: string) => void;
}

export function NoteDialog({ open, onOpenChange, note, onSaveContent }: NoteDialogProps) {
  const contentRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
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
    if (open && editor) {
      const content = note?.content || '';
      contentRef.current = content;
      editor.commands.setContent(content);
      editor.commands.focus('end');
    }
  }, [note, open, editor]);
  
  const handleSave = () => {
    if (note) {
      onSaveContent(contentRef.current);
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
        <DialogTitle className="text-2xl font-bold text-center mb-4">{note?.title || 'Note'}</DialogTitle>
        
        <div className="flex-grow pt-4 overflow-y-auto">
           <RichTextEditor editor={editor} />
        </div>
        <RichTextToolbar editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
