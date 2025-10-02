
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, Sparkles, Route, Rows3 } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to Listily!</DialogTitle>
          <DialogDescription>
            Here’s a quick guide to help you get started.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm">
           <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
                <Route className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Two Apps in One</h4>
              <p className="text-muted-foreground">Use the navigation bar at the top to switch between the "Progress" task tracker and the "Notes" app.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
                <Rows3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Listspaces</h4>
              <p className="text-muted-foreground">Organize your tasks and notes into separate lists called "Listspaces" using the sidebar menu.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
                <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Add Items</h4>
              <p className="text-muted-foreground">Add new tasks in "Progress" or create new notes in "Notes".</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
                <Check className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Complete Tasks</h4>
              <p className="text-muted-foreground">In "Progress", click the checkbox to mark a task as complete. Your progress bar will update.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
                <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Get AI Suggestions</h4>
              <p className="text-muted-foreground">In "Progress", click "Suggest Tasks" to get AI-powered recommendations.</p>
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
