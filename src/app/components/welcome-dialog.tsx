"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Edit, Plus, Trash2, Sparkles } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to Taskily!</DialogTitle>
          <DialogDescription>
            Here’s a quick guide to help you get started.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-600">
                <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Add Tasks</h4>
              <p className="text-muted-foreground">Type a task in the input field and press Enter or click the plus button to add it to your list.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-600">
                <Check className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Complete Tasks</h4>
              <p className="text-muted-foreground">Click the checkbox next to a task to mark it as complete. Your progress will update automatically.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <Edit className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Edit Tasks</h4>
              <p className="text-muted-foreground">Hover over a task and click the pencil icon to edit its name.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Delete Tasks</h4>
              <p className="text-muted-foreground">Hover over a task and click the trash icon to permanently delete it.</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Get AI Suggestions</h4>
              <p className="text-muted-foreground">Click the "Suggest Tasks" button to get AI-powered recommendations based on your current task list.</p>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
