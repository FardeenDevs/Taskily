
"use client";

import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NoteItemProps {
  note: Note;
  onEditContent: () => void;
  onEditTitle: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, onEditContent, onEditTitle, onDelete }: NoteItemProps) {
  return (
    <Card className="flex flex-col h-full group bg-secondary/30 hover:bg-secondary/60 transition-colors duration-200">
      <CardHeader className="flex-row items-start justify-between pb-2" onClick={onEditContent}>
        <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold leading-tight line-clamp-2">{note.title}</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onEditTitle(); }} aria-label={`Edit note title "${note.title}"`}>
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
         <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 -mr-2 -mt-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEditContent(); }} aria-label={`Edit note "${note.title}"`}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructiveIcon" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label={`Delete note "${note.title}"`}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0 cursor-pointer" onClick={onEditContent}>
        <div 
            className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
            dangerouslySetInnerHTML={{ __html: note.content || "No content" }} 
        />
      </CardContent>
       <CardFooter className="pt-2 pb-4" onClick={onEditContent}>
        <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  );
}
