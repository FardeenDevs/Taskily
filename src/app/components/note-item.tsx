
"use client";

import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface NoteItemProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <Card className="relative flex flex-col h-full group bg-secondary/30 hover:bg-secondary/60 transition-colors duration-200" onClick={onEdit}>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className="text-base font-bold leading-tight line-clamp-2 pr-8">{note.title}</CardTitle>
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructiveIcon" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }} aria-label={`Delete note "${note.title}"`}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the note titled "{note.title}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-red-600 hover:bg-red-700 text-white">
                        Yes, delete it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
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
