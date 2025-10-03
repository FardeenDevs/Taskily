
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, Sparkles, Route, Rows3, ShieldCheck, User } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to Listily!</DialogTitle>
          <DialogDescription>
            Your all-in-one productivity app just got a major upgrade. Here’s a quick guide to what's new.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-1 gap-y-5 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6">
           <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <Route className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Two Apps in One</h4>
              <p className="text-muted-foreground">Switch between the "Progress" task tracker and the "Notes" app using the top navigation bar.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <Rows3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Organize with Listspaces</h4>
              <p className="text-muted-foreground">Use the sidebar to create and manage separate lists for your tasks and notes.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Prioritize & Plan</h4>
              <p className="text-muted-foreground">Assign Priority (P1-P5) and Effort (E1-E5) levels when adding tasks to better organize your work.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Secure Your Notes</h4>
              <p className="text-muted-foreground">Protect sensitive information by setting a password for the notes within any Listspace.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Get AI Suggestions</h4>
              <p className="text-muted-foreground">In "Progress", click "Suggest Tasks" to get AI-powered recommendations based on your current list.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-primary">
                <User className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">Manage Your Profile</h4>
              <p className="text-muted-foreground">Click your avatar to access your profile and application settings, including dark mode!</p>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Let's Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
