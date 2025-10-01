
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PasswordDialogProps {
  open: boolean;
  onUnlock: (password: string) => void;
  workspaceName: string;
}

export function PasswordDialog({ open, onUnlock, workspaceName }: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleUnlock = () => {
    onUnlock(password);
    // Don't close the dialog here; the parent will close it if unlock is successful
    setPassword("");
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Unlock '{workspaceName}'</DialogTitle>
          <DialogDescription>
            This listspace is password protected. Please enter the password to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUnlock}>Unlock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add showCloseButton to DialogContent props if it's not there
declare module "@radix-ui/react-dialog" {
  interface DialogContentProps {
    showCloseButton?: boolean;
  }
}

// You might need to update your actual DialogContent component to handle this prop
// For example in src/components/ui/dialog.tsx
/*
const DialogContent = React.forwardRef<...>(({ ..., showCloseButton = true }, ref) => (
  ...
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close ...>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
  ...
))
*/
