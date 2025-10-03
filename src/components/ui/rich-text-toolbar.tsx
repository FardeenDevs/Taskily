
"use client";

import { type Editor } from '@tiptap/react';
import { Bold, Italic, Underline, List, Strikethrough, ListOrdered } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface RichTextToolbarProps {
  editor: Editor | null;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-2 flex items-center gap-1 z-[60]">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
