
"use client";

import { useState, useEffect, useRef } from 'react';
import { type Note } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  onSave: (id: string | null, title: string, content: string) => void;
}

export function NoteDialog({ open, onOpenChange, note, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState('');
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
      if (note) {
        setTitle(note.title);
        contentRef.current = note.content;
        editor.commands.setContent(note.content);
      } else {
        setTitle('');
        contentRef.current = '';
        editor.commands.setContent('');
      }
    }
  }, [note, open, editor]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(note?.id ?? null, title, contentRef.current);
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
        <DialogHeader>
          <DialogTitle>
             <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your note title..."
                className="text-4xl font-extrabold border-0 shadow-none focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground/40"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        editor?.commands.focus();
                    }
                }}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow pt-4 overflow-y-auto">
           <RichTextEditor editor={editor} />
        </div>
        <RichTextToolbar editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
