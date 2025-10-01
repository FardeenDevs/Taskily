
"use client";

import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NoteItemProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <Card className="flex flex-col h-full group bg-secondary/30 hover:bg-secondary/60 transition-colors duration-200" onClick={onEdit}>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className="text-base font-bold leading-tight line-clamp-2 pr-8">{note.title}</CardTitle>
         <Button variant="destructiveIcon" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label={`Delete note "${note.title}"`}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow pt-0 cursor-pointer">
        <div 
            className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
            dangerouslySetInnerHTML={{ __html: note.content || "No content" }} 
        />
      </CardContent>
       <CardFooter className="pt-2 pb-4">
        <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  );
}
