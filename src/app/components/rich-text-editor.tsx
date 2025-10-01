
"use client";

import { EditorContent, type Editor } from '@tiptap/react';

interface RichTextEditorProps {
  editor: Editor | null;
}

export function RichTextEditor({ editor }: RichTextEditorProps) {
  return <EditorContent editor={editor} />;
}
