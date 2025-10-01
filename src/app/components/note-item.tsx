
"use client";

import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NoteItemProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <Card className="flex flex-col h-full group bg-secondary/30 hover:bg-secondary/60 transition-colors duration-200 cursor-pointer" onClick={onEdit}>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className="text-base font-bold leading-tight line-clamp-2">{note.title}</CardTitle>
         <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 -mr-2 -mt-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label={`Edit note "${note.title}"`}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructiveIcon" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label={`Delete note "${note.title}"`}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
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
