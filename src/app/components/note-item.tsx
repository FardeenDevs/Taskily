"use client";

import { type Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface NoteItemProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <Accordion type="single" collapsible className="w-full bg-secondary/50 rounded-lg px-4">
        <AccordionItem value={note.id} className="border-b-0">
            <div className="group flex items-center justify-between">
                <AccordionTrigger className="flex-1 text-base font-semibold py-4 hover:no-underline">
                    {note.title}
                </AccordionTrigger>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 pl-4">
                    <Button variant="editIcon" size="icon" className="h-8 w-8" onClick={onEdit} aria-label={`Edit note "${note.title}"`}>
                        <Pencil />
                    </Button>
                    <Button variant="destructiveIcon" size="icon" className="h-8 w-8" onClick={onDelete} aria-label={`Delete note "${note.title}"`}>
                        <Trash2 />
                    </Button>
                </div>
            </div>
            <AccordionContent>
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap pb-4">
                    {note.content}
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  );
}
