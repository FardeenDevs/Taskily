
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  onUnlock: (password: string) => Promise<boolean>;
  isUnlocking: boolean;
}

export function PasswordPromptDialog({ open, onOpenChange, workspaceName, onUnlock, isUnlocking }: PasswordPromptDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlockAttempt = async () => {
    setIsLoading(true);
    setError(null);
    const success = await onUnlock(password);
    if (!success) {
      setError("Incorrect password or backup code. Please try again.");
    }
    // Don't set isLoading to false here, it will be controlled by isUnlocking prop
    setIsLoading(false); 
  };

  const totalLoading = isLoading || isUnlocking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Notes Locked</DialogTitle>
          <DialogDescription>
            The notes for "{workspaceName}" are password protected.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes-password">Password or Backup Code</Label>
            <Input
              id="notes-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !totalLoading && handleUnlockAttempt()}
              disabled={totalLoading}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleUnlockAttempt} disabled={totalLoading || !password}>
            {totalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUnlocking ? "Unlocking..." : "Unlock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
